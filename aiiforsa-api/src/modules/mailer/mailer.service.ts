import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendMail(options: EmailOptions): Promise<void> {
    try {
      let html = options.html;

      if (options.template) {
        html = this.loadTemplate(options.template, options.context || {});
      }

      const mailOptions = {
        from: this.configService.get<string>('MAIL_FROM'),
        to: options.to,
        subject: options.subject,
        html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  private loadTemplate(
    templateName: string,
    context: Record<string, any>,
  ): string {
    try {
      const templatePath = join(
        process.cwd(),
        'templates',
        'email',
        `${templateName}.html`,
      );
      let template = readFileSync(templatePath, 'utf-8');

      // Simple template engine - replace {{variable}} with context values
      Object.keys(context).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, context[key]);
      });

      return template;
    } catch (error) {
      this.logger.error(`Failed to load template: ${templateName}`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    await this.sendMail({
      to,
      subject: 'Welcome to AIIFORSA!',
      template: 'welcome',
      context: {
        firstName,
        year: new Date().getFullYear(),
      },
    });
  }

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    firstName: string,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: 'Reset Your Password',
      template: 'password-reset',
      context: {
        firstName,
        resetToken,
        resetUrl: `${this.configService.get('cors.origin')}/reset-password?token=${resetToken}`,
      },
    });
  }
}
