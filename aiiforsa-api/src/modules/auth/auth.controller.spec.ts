import { Test, TestingModule } from '@nestjs/testing';
import { createMockUser } from '../../../test/factories/user.factory';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUser = createMockUser();

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('POST /auth/login', () => {
    it('should return tokens on successful login', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const expectedResult = {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle login errors', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrong' };

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('POST /auth/register', () => {
    it('should return tokens on successful registration', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };
      const expectedResult = {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle registration errors', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'User',
      };

      mockAuthService.register.mockRejectedValue(
        new Error('User already exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        'User already exists',
      );
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new access token', async () => {
      const refreshToken = 'refresh-token';
      const expectedResult = { accessToken: 'new-access-token' };

      mockAuthService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refreshToken(refreshToken);

      expect(result).toEqual(expectedResult);
      expect(service.refreshToken).toHaveBeenCalledWith(refreshToken);
    });

    it('should handle invalid refresh token', async () => {
      const refreshToken = 'invalid-token';

      mockAuthService.refreshToken.mockRejectedValue(
        new Error('Invalid refresh token'),
      );

      await expect(controller.refreshToken(refreshToken)).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });

  describe('POST /auth/logout', () => {
    it('should successfully logout user', async () => {
      const userId = mockUser.id;
      const expectedResult = {
        message: 'Logged out successfully',
        tokenAfterLogout: null,
      };

      mockAuthService.logout.mockResolvedValue(expectedResult);

      const result = await controller.logout(userId);

      expect(result).toEqual(expectedResult);
      expect(service.logout).toHaveBeenCalledWith(userId);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset email', async () => {
      const email = 'test@example.com';
      const expectedResult = { message: 'OTP sent to your email' };

      mockAuthService.requestPasswordReset.mockResolvedValue(expectedResult);

      const result = await controller.forgotPassword(email);

      expect(result).toEqual(expectedResult);
      expect(service.requestPasswordReset).toHaveBeenCalledWith(email);
    });

    it('should handle user not found', async () => {
      const email = 'nonexistent@example.com';

      mockAuthService.requestPasswordReset.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(controller.forgotPassword(email)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should successfully reset password', async () => {
      const body = {
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'newPassword123',
      };
      const expectedResult = { message: 'Password reset successfully' };

      mockAuthService.resetPassword.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(body);

      expect(result).toEqual(expectedResult);
      expect(service.resetPassword).toHaveBeenCalledWith(
        body.email,
        body.otp,
        body.newPassword,
      );
    });

    it('should handle invalid OTP', async () => {
      const body = {
        email: 'test@example.com',
        otp: 'invalid-otp',
        newPassword: 'newPassword123',
      };

      mockAuthService.resetPassword.mockRejectedValue(new Error('Invalid OTP'));

      await expect(controller.resetPassword(body)).rejects.toThrow(
        'Invalid OTP',
      );
    });

    it('should handle expired OTP', async () => {
      const body = {
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'newPassword123',
      };

      mockAuthService.resetPassword.mockRejectedValue(
        new Error('OTP expired or invalid'),
      );

      await expect(controller.resetPassword(body)).rejects.toThrow(
        'OTP expired or invalid',
      );
    });
  });
});
