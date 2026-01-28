import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status', () => {
      const result = controller.check();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('message');
    });

    it('should return status "ok"', () => {
      const result = controller.check();

      expect(result.status).toBe('ok');
    });

    it('should return valid timestamp', () => {
      const result = controller.check();
      const timestamp = new Date(result.timestamp);

      expect(timestamp instanceof Date).toBe(true);
      expect(timestamp.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should return positive uptime', () => {
      const result = controller.check();

      expect(result.uptime).toBeGreaterThan(0);
      expect(typeof result.uptime).toBe('number');
    });

    it('should return success message', () => {
      const result = controller.check();

      expect(result.message).toBe('Server is running');
    });
  });
});
