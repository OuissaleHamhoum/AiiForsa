import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { createMockUser } from '../../../test/factories/user.factory';
import { MailerService } from '../mailer/mailer.service';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let mailerService: MailerService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let redisClient: any;

  const mockUser = createMockUser({
    email: 'test@example.com',
    password: 'hashed-password',
  });

  const mockRedisClient = {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
    del: jest.fn().mockResolvedValue(1),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                JWT_EXPIRATION_TIME: '24h',
                JWT_REFRESH_EXPIRATION_TIME: '7d',
              };
              return config[key];
            }),
          },
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    mailerService = module.get<MailerService>(MailerService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    redisClient = module.get('REDIS_CLIENT');
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeDefined();
      expect(result?.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null with incorrect password', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrong-password',
      );

      expect(result).toBeNull();
    });

    it('should return null when user not found', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toEqual(
        expect.objectContaining({ email: mockUser.email }),
      );
      expect(redisClient.set).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should successfully register new user', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.register({
        email: 'newuser@example.com',
        password: 'password',
        name: 'New User',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      const { password: _, ...userWithoutPassword } = mockUser;
      expect(result.user).toEqual(userWithoutPassword);
      expect(redisClient.set).toHaveBeenCalled();
    });

    it('should throw error when user already exists', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password',
          name: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('refreshToken', () => {
    it('should generate new access token with valid refresh token', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
      });
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new-jwt-token');
      mockRedisClient.get.mockResolvedValue('refresh-token');

      const result = await service.refreshToken('refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('new-jwt-token');
    });

    it('should throw error when user not found during refresh', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        sub: 'invalid-id',
        email: 'test@example.com',
      });
      jest.spyOn(userService, 'findOne').mockResolvedValue(null as any);

      await expect(service.refreshToken('refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw error when refresh token does not match stored token', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
      });
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      mockRedisClient.get.mockResolvedValue('different-stored-token');

      await expect(service.refreshToken('refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw error when refresh token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.logout(mockUser.id);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Logged out successfully');
      expect(redisClient.del).toHaveBeenCalledWith(
        `refresh_token:${mockUser.id}`,
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset OTP', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      mockRedisClient.get.mockResolvedValue('123456');

      const result = await service.requestPasswordReset('test@example.com');

      expect(result).toHaveProperty('message');
      expect(mailerService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(redisClient.set).toHaveBeenCalled();
    });

    it('should return success message when user not found (security)', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      const result = await service.requestPasswordReset(
        'nonexistent@example.com',
      );

      expect(result).toEqual({
        message: 'If the email exists, a password reset link has been sent.',
      });
      expect(mailerService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with correct OTP', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      mockRedisClient.get.mockResolvedValue('123456');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      jest.spyOn(userService, 'updatePassword').mockResolvedValue(mockUser);

      const result = await service.resetPassword(
        'test@example.com',
        '123456',
        'newPassword',
      );

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Password reset successfully');
      expect(userService.updatePassword).toHaveBeenCalledWith(
        mockUser.id,
        'new-hashed-password',
      );
      expect(redisClient.del).toHaveBeenCalledWith(
        `forgot_password_otp:${mockUser.id}`,
      );
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.resetPassword(
          'nonexistent@example.com',
          '123456',
          'newPassword',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error when OTP is expired', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      mockRedisClient.get.mockResolvedValue(null);

      await expect(
        service.resetPassword('test@example.com', '123456', 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error when OTP is invalid', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      mockRedisClient.get.mockResolvedValue('654321');

      await expect(
        service.resetPassword('test@example.com', '123456', 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
