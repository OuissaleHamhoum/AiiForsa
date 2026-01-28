import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
      getType: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      const context = createMockExecutionContext({ id: 1, role: 'JOB_SEEKER' });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      const context = createMockExecutionContext({ id: 1, role: 'ADMIN' });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      const context = createMockExecutionContext({ id: 1, role: 'JOB_SEEKER' });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const context = createMockExecutionContext({ id: 1, role: 'EMPLOYER' });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['ADMIN', 'EMPLOYER']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user has no role', () => {
      const context = createMockExecutionContext({ id: 1 });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should deny access when user is not authenticated', () => {
      const context = createMockExecutionContext(null);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should check roles from both handler and class decorators', () => {
      const context = createMockExecutionContext({ id: 1, role: 'ADMIN' });
      const getAllAndOverrideSpy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['ADMIN']);

      guard.canActivate(context);

      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should handle JOB_SEEKER role', () => {
      const context = createMockExecutionContext({ id: 1, role: 'JOB_SEEKER' });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['JOB_SEEKER']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should handle EMPLOYER role', () => {
      const context = createMockExecutionContext({ id: 1, role: 'EMPLOYER' });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['EMPLOYER']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should be case-sensitive for role matching', () => {
      const context = createMockExecutionContext({ id: 1, role: 'admin' });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });
  });
});
