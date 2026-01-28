import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    // Disable detailed error messages in production
    abortOnError: false,
  });
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const isProduction =
    configService.get<string>('app.environment') === 'production';

  // Security middlewares - Enhanced Helmet configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // Compression with customization
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6,
    }),
  );

  // Disable Express powered-by header
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // CORS configuration - Enhanced security
  const allowedOrigins = (
    configService.get<string>('cors.origin') || 'http://localhost:3000'
  ).split(',');

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.includes('*')
      ) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Page-Size'],
    maxAge: 3600,
  });

  // Global validation pipe - Enhanced security
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: isProduction,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        if (isProduction) {
          // Don't expose detailed validation errors in production
          return new BadRequestException('Validation failed');
        }
        const messages = errors.map((error) => {
          return `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`;
        });
        return new BadRequestException(
          `Validation failed: ${messages.join('; ')}`,
        );
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation - Only in non-production
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('AIIFORSA API')
      .setDescription('The AIIFORSA API description')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger documentation enabled');
  } else {
    logger.log('Swagger documentation disabled in production');
  }

  // Enable shutdown hooks for graceful shutdown
  app.enableShutdownHooks();

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📊 Environment: ${configService.get<string>('app.environment')}`);
  logger.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);

  if (!isProduction) {
    logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  }

  // Graceful shutdown handlers
  process.on('SIGTERM', () => {
    void (async () => {
      logger.log('SIGTERM signal received: closing HTTP server');
      await app.close();
      logger.log('HTTP server closed');
      process.exit(0);
    })();
  });

  process.on('SIGINT', () => {
    void (async () => {
      logger.log('SIGINT signal received: closing HTTP server');
      await app.close();
      logger.log('HTTP server closed');
      process.exit(0);
    })();
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

void bootstrap();
