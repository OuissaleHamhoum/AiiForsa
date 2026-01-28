import {
  Inject,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import Redis from 'ioredis';
import ms from 'ms';
import { MailerService } from '../mailer/mailer.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  private getRefreshExpirationSeconds(): number {
    const duration =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') || '7d';
    return Math.floor(ms(duration) / 1000);
  }

  private getAccessExpiration(): string {
    return this.configService.get<string>('JWT_EXPIRATION_TIME') || '24h';
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.getAccessExpiration(),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') || '7d',
    });
    await this.redis.set(
      `refresh_token:${user.id}`,
      refreshToken,
      'EX',
      this.getRefreshExpirationSeconds(),
    );

    return { user, accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) throw new ConflictException('User already exists');

    const user = await this.userService.create(registerDto);
    const { password: _, ...userWithoutPassword } = user;
    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.getAccessExpiration(),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') || '7d',
    });

    await this.redis.set(
      `refresh_token:${user.id}`,
      refreshToken,
      'EX',
      this.getRefreshExpirationSeconds(),
    );

    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findOne(payload.sub);
      if (!user) throw new UnauthorizedException('User not found');

      const storedToken = await this.redis.get(`refresh_token:${user.id}`);
      if (storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.jwtService.sign(
        { email: user.email, sub: user.id, role: user.role },
        { expiresIn: this.getAccessExpiration() },
      );

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.redis.del(`refresh_token:${userId}`);
    const tokenAfterLogout = await this.redis.get(`refresh_token:${userId}`);
    return {
      message: 'Logged out successfully',
      tokenAfterLogout,
    };
  }
  private generateOTP(length = 6): string {
    return crypto
      .randomInt(0, Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }

  async requestPasswordReset(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Return success for security reasons (avoid email enumeration)
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    const otp = this.generateOTP(6);
    const ttl = 5 * 60; // 5 minutes

    await this.redis.set(`forgot_password_otp:${user.id}`, otp, 'EX', ttl);
    const checkOtp = await this.redis.get(`forgot_password_otp:${user.id}`);
    // Send OTP email using your MailerService
    await this.mailerService.sendPasswordResetEmail(
      user.email,
      otp,
      user.name || 'User',
    );

    return { message: 'OTP sent to your email' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const storedOtp = await this.redis.get(`forgot_password_otp:${user.id}`);
    if (!storedOtp) throw new UnauthorizedException('OTP expired or invalid');
    if (storedOtp !== otp) throw new UnauthorizedException('Invalid OTP');

    await this.redis.del(`forgot_password_otp:${user.id}`);

    // Hash the new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(user.id, hashedPassword);

    return { message: 'Password reset successfully' };
  }

  async getSession(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return user;
  }
}
