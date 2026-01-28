import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let jwtService: JwtService;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    jwtService = new JwtService({ secret: 'test-secret' });
    guard = new JwtAuthGuard(reflector, jwtService);

    const mockRequest = {
      headers: { authorization: 'Bearer valid.jwt.token' },
      user: undefined,
    };

    mockExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getType: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ExecutionContext;
  });

  describe('canActivate', () => {
    it('should allow access to public routes', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should authenticate protected routes with valid JWT', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const mockRequest = {
        headers: { authorization: 'Bearer valid.jwt.token' },
        user: undefined,
      };

      const context = {
        ...mockExecutionContext,
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;

      // Mock JWT verification
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        sub: '1',
        email: 'test@example.com',
        role: 'USER',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.jwt.token');
      expect(mockRequest.user).toEqual({
        id: '1',
        email: 'test@example.com',
        role: 'USER',
      });
    });

    it('should throw error for protected routes without token', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const mockRequest = {
        headers: {},
        user: undefined,
      };

      const context = {
        ...mockExecutionContext,
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        'No token provided',
      );
    });

    it('should throw error for invalid JWT token', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const mockRequest = {
        headers: { authorization: 'Bearer invalid.jwt.token' },
        user: undefined,
      };

      const context = {
        ...mockExecutionContext,
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');
    });
  });
});
