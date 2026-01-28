import { ExecutionContext, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';

// Custom modules
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommunityModule } from './modules/community/community.module';
import { HealthModule } from './modules/health/health.module';
import { InterviewModule } from './modules/interview/interview.module';
import { JobApplicationModule } from './modules/job-application/job-application.module';
import { JobModule } from './modules/job/job.module'; //normalement jobModule suffira.
import { JobRecommendationModule } from './modules/jobrecommendation/job-recommendation.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UserModule } from './modules/user/user.module';
import { VoiceInterviewModule } from './modules/voice-interview/voice-interview.module';
import { XpModule } from './modules/xp/xp.module';

// Guards and interceptors
import { ThrottlerGuard } from '@nestjs/throttler';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// Configuration
import { configuration } from './config/configuration';
import { ResumeModule } from './modules/resume/resume.module';
import { CommonServicesModule } from './common/services/common-services.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // Rate limiting - Production-ready configuration
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: config.get<number>('throttle.shortTtl', 1) * 1000,
            limit: config.get<number>('throttle.shortLimit', 10),
          },
          {
            name: 'medium',
            ttl: config.get<number>('throttle.mediumTtl', 10) * 1000,
            limit: config.get<number>('throttle.mediumLimit', 50),
          },
          {
            name: 'long',
            ttl: config.get<number>('throttle.longTtl', 60) * 1000,
            limit: config.get<number>('throttle.longLimit', 100),
          },
        ],
        errorMessage: 'Too many requests, please try again later',
        ignoreUserAgents: [/health-check/],
        skipIf: (context: ExecutionContext) => {
          // Skip rate limiting for health checks
          const request = context.switchToHttp().getRequest();
          return request.url.includes('/health');
        },
      }),
    }),

    // JWT Module (global)
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expirationTime'),
        },
      }),
      inject: [ConfigService],
    }),

    // Database
    PrismaModule,

    // Common services (ClamAV, etc.)
    CommonServicesModule,

    // Feature modules
    AuthModule,
    UserModule,
    MailerModule,
    HealthModule,
    JobApplicationModule,
    JobModule,
    JobRecommendationModule,
    InterviewModule,
    CommunityModule,
    ResumeModule,
    XpModule,
    NotificationsModule,
    VoiceInterviewModule,
  ],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    // Global filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
