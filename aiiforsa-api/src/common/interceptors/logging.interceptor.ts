import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { throwError } from 'rxjs';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;
    const url = request.url;
    const now = Date.now();
    const ip = request.ip || request.connection.remoteAddress || 'unknown';

    // Color-code HTTP methods
    const methodColor = this.getMethodColor(method);
    const coloredMethod = `${methodColor}${method}${colors.reset}`;

    // Log incoming request (simple format)
    this.logger.log(
      `${colors.dim}➡️ ${colors.reset} ${coloredMethod} ${url} ${colors.gray}(${ip})${colors.reset}`,
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        const statusCode = response.statusCode;

        // Color-code status codes and create appropriate log message
        const statusInfo = this.getStatusInfo(statusCode);
        const durationColor =
          duration > 1000
            ? colors.yellow
            : duration > 500
              ? colors.gray
              : colors.green;
        const durationStr = `${durationColor}${duration}ms${colors.reset}`;

        this.logger.log(
          `${statusInfo.icon} ${coloredMethod} ${url} ${statusInfo.coloredCode} ${durationStr}`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - now;
        const statusCode = error.status || 500;

        // Enhanced error logging
        const statusInfo = this.getStatusInfo(statusCode);
        const durationStr = `${colors.red}${duration}ms${colors.reset}`;

        // Log the error with full details
        this.logger.error(
          `${statusInfo.icon} ${coloredMethod} ${url} ${statusInfo.coloredCode} ${durationStr}`,
        );

        // Log error details if available
        if (error.message) {
          this.logger.error(
            `${colors.red}Error: ${error.message}${colors.reset}`,
          );
        }

        // Log stack trace in development
        if (process.env.NODE_ENV !== 'production' && error.stack) {
          this.logger.error(`${colors.dim}${error.stack}${colors.reset}`);
        }

        return throwError(() => error);
      }),
    );
  }

  private getMethodColor(method: string): string {
    switch (method) {
      case 'GET':
        return colors.green;
      case 'POST':
        return colors.blue;
      case 'PUT':
      case 'PATCH':
        return colors.yellow;
      case 'DELETE':
        return colors.red;
      default:
        return colors.gray;
    }
  }

  private getStatusInfo(statusCode: number): {
    icon: string;
    coloredCode: string;
  } {
    if (statusCode >= 500) {
      return {
        icon: '💥',
        coloredCode: `${colors.bgRed}${colors.bright}${statusCode}${colors.reset}`,
      };
    } else if (statusCode >= 400) {
      return {
        icon: '⚠️',
        coloredCode: `${colors.red}${colors.bright}${statusCode}${colors.reset}`,
      };
    } else if (statusCode >= 300) {
      return {
        icon: '↪️',
        coloredCode: `${colors.yellow}${colors.bright}${statusCode}${colors.reset}`,
      };
    } else if (statusCode >= 200) {
      return {
        icon: '✅',
        coloredCode: `${colors.green}${colors.bright}${statusCode}${colors.reset}`,
      };
    } else {
      return {
        icon: '❓',
        coloredCode: `${colors.gray}${statusCode}${colors.reset}`,
      };
    }
  }
}
