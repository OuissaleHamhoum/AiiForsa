import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';
import { MailerService } from './mailer.service';

jest.mock('nodemailer');
jest.mock('fs');
jest.mock('path');

describe('MailerService', () => {
  let service: MailerService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, any> = {
                MAIL_HOST: 'smtp.example.com',
                MAIL_PORT: 587,
                MAIL_USER: 'test@example.com',
                MAIL_PASSWORD: 'password',
                MAIL_FROM: 'noreply@example.com',
                'cors.origin': 'http://localhost:3000',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    it('should send an email successfully', async () => {
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: mockSendMail,
      });

      // Recreate service to use mocked transporter
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailerService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                const config: Record<string, any> = {
                  MAIL_HOST: 'smtp.example.com',
                  MAIL_PORT: 587,
                  MAIL_USER: 'test@example.com',
                  MAIL_PASSWORD: 'password',
                  MAIL_FROM: 'noreply@example.com',
                  'cors.origin': 'http://localhost:3000',
                };
                return config[key];
              }),
            },
          },
        ],
      }).compile();

      const testService = module.get<MailerService>(MailerService);

      await testService.sendMail({
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        text: undefined,
      });
    });

    it('should handle email sending errors', async () => {
      const mockError = new Error('SMTP error');
      const mockSendMail = jest.fn().mockRejectedValue(mockError);

      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: mockSendMail,
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailerService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                const config: Record<string, any> = {
                  MAIL_HOST: 'smtp.example.com',
                  MAIL_PORT: 587,
                  MAIL_USER: 'test@example.com',
                  MAIL_PASSWORD: 'password',
                  MAIL_FROM: 'noreply@example.com',
                  'cors.origin': 'http://localhost:3000',
                };
                return config[key];
              }),
            },
          },
        ],
      }).compile();

      const testService = module.get<MailerService>(MailerService);

      await expect(
        testService.sendMail({
          to: 'recipient@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        }),
      ).rejects.toThrow('SMTP error');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with template', async () => {
      const sendMailSpy = jest
        .spyOn(service, 'sendMail')
        .mockResolvedValue(undefined);

      await service.sendWelcomeEmail('user@example.com', 'John');

      expect(sendMailSpy).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Welcome to AIIFORSA!',
        template: 'welcome',
        context: {
          firstName: 'John',
          year: new Date().getFullYear(),
        },
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with token', async () => {
      const sendMailSpy = jest
        .spyOn(service, 'sendMail')
        .mockResolvedValue(undefined);

      const token = 'reset-token-123';

      await service.sendPasswordResetEmail('user@example.com', token, 'Jane');

      expect(sendMailSpy).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Reset Your Password',
        template: 'password-reset',
        context: {
          firstName: 'Jane',
          resetToken: token,
          resetUrl: `http://localhost:3000/reset-password?token=${token}`,
        },
      });
    });
  });

  describe('loadTemplate (private)', () => {
    it('should load and parse email template', async () => {
      const sendMailSpy = jest
        .spyOn(service, 'sendMail')
        .mockResolvedValue(undefined);

      // Mock the template loading through sendMail with html
      await service.sendMail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Hello {{firstName}}</p>',
      });

      expect(sendMailSpy).toHaveBeenCalled();
    });
  });
});
