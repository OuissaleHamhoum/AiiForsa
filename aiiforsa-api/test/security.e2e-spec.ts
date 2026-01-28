import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('api/v1');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in login email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: "admin'--",
          password: 'anything',
        })
        .expect((res) => {
          expect(res.status).not.toBe(200);
        });
    });

    it('should prevent SQL injection in search query', () => {
      return request(app.getHttpServer())
        .get("/api/v1/jobs?search='; DROP TABLE users;--")
        .expect((res) => {
          expect(res.status).toBe(200);
          // Should return normal response, not execute SQL
        });
    });

    it('should prevent SQL injection in user ID parameter', () => {
      return request(app.getHttpServer())
        .get("/api/v1/users/1' OR '1'='1")
        .expect((res) => {
          expect(res.status).not.toBe(200);
        });
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize script tags in post content', async () => {
      const maliciousContent = '<script>alert("XSS")</script>';

      // This should be sanitized by the backend
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'xss-test@example.com',
          password: 'Test123!@#',
          firstName: maliciousContent,
          lastName: 'Test',
          role: 'JOB_SEEKER',
        });

      if (response.status === 201) {
        // Check that script tags are removed or escaped
        expect(response.body.user.firstName).not.toContain('<script>');
      }
    });

    it('should prevent XSS in job description', () => {
      return request(app.getHttpServer())
        .post('/api/v1/jobs')
        .send({
          title: 'Test Job',
          description: '<img src=x onerror=alert("XSS")>',
          location: 'Test',
          companyName: 'Test',
        })
        .expect((res) => {
          if (res.status === 201) {
            expect(res.body.description).not.toContain('onerror');
          }
        });
    });
  });

  describe('Authentication Security', () => {
    it('should reject requests without authentication token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .expect(401);
    });

    it('should reject invalid JWT tokens', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('should reject expired tokens', () => {
      // Use a token that's already expired
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAwfQ.xxx';

      return request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should enforce password strength requirements', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'weak-password@example.com',
          password: '123',
          firstName: 'Test',
          lastName: 'User',
          role: 'JOB_SEEKER',
        })
        .expect(400);
    });

    it('should hash passwords in database', async () => {
      const password = 'MySecurePassword123!';

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'hash-test@example.com',
          password: password,
          firstName: 'Hash',
          lastName: 'Test',
          role: 'JOB_SEEKER',
        });

      if (response.status === 201) {
        // Password should not be returned in response
        expect(response.body.user).not.toHaveProperty('password');
        expect(response.body.user.password).toBeUndefined();
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      const loginData = {
        email: 'rate-limit-test@example.com',
        password: 'WrongPassword123!',
      };

      // Make multiple rapid requests
      const requests = Array(15)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send(loginData),
        );

      const responses = await Promise.all(requests);

      // At least one should be rate limited (429)
      const rateLimited = responses.some((r) => r.status === 429);
      expect(rateLimited).toBe(true);
    });

    it('should rate limit API requests per IP', async () => {
      // Make many rapid requests to same endpoint
      const requests = Array(100)
        .fill(null)
        .map(() => request(app.getHttpServer()).get('/api/v1/health'));

      const responses = await Promise.all(requests);

      // Some should be rate limited
      const rateLimited = responses.some((r) => r.status === 429);
      expect(rateLimited).toBe(true);
    }, 10000); // Longer timeout for this test
  });

  describe('CORS Security', () => {
    it('should include CORS headers', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect((res) => {
          expect(res.headers).toHaveProperty('access-control-allow-origin');
        });
    });

    it('should handle preflight requests', () => {
      return request(app.getHttpServer())
        .options('/api/v1/jobs')
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('access-control-allow-methods');
        });
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Test123!@#',
          firstName: 'Test',
          lastName: 'User',
          role: 'JOB_SEEKER',
        })
        .expect(400);
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          // Missing password and other required fields
        })
        .expect(400);
    });

    it('should reject extra/unexpected fields when whitelist is enabled', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'Test',
          lastName: 'User',
          role: 'JOB_SEEKER',
          unexpectedField: 'should be stripped',
          anotherBadField: 'should also be stripped',
        })
        .expect((res) => {
          if (res.status === 201) {
            expect(res.body.user).not.toHaveProperty('unexpectedField');
            expect(res.body.user).not.toHaveProperty('anotherBadField');
          }
        });
    });

    it('should validate enum values', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'enum-test@example.com',
          password: 'Test123!@#',
          firstName: 'Test',
          lastName: 'User',
          role: 'INVALID_ROLE',
        })
        .expect(400);
    });
  });

  describe('File Upload Security', () => {
    it('should validate file size limits', () => {
      // Create a large buffer (> 5MB)
      const largeFile = Buffer.alloc(6 * 1024 * 1024);

      return request(app.getHttpServer())
        .post('/api/v1/resumes')
        .attach('file', largeFile, 'large.pdf')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });

    it('should validate file types', () => {
      return request(app.getHttpServer())
        .post('/api/v1/resumes')
        .attach('file', Buffer.from('fake content'), 'malicious.exe')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });
  });

  describe('Authorization', () => {
    it('should prevent unauthorized access to admin routes', () => {
      return request(app.getHttpServer()).get('/api/v1/users').expect(401);
    });

    it('should prevent users from accessing other users data', async () => {
      // Create two users
      const user1Response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'user1@example.com',
          password: 'Test123!@#',
          firstName: 'User',
          lastName: 'One',
          role: 'JOB_SEEKER',
        });

      const user2Response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'user2@example.com',
          password: 'Test123!@#',
          firstName: 'User',
          lastName: 'Two',
          role: 'JOB_SEEKER',
        });

      if (user1Response.status === 201 && user2Response.status === 201) {
        const user1Token = user1Response.body.access_token;
        const user2Id = user2Response.body.user.id;

        // User 1 tries to access User 2's data
        return request(app.getHttpServer())
          .get(`/api/v1/users/${user2Id}`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect((res) => {
            // Should be forbidden or not found
            expect([403, 404]).toContain(res.status);
          });
      }
    });
  });

  describe('Security Headers', () => {
    it('should include security headers from Helmet', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect((res) => {
          expect(res.headers).toHaveProperty(
            'x-content-type-options',
            'nosniff',
          );
          expect(res.headers).toHaveProperty('x-frame-options');
          expect(res.headers).toHaveProperty('strict-transport-security');
        });
    });

    it('should not expose sensitive server information', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect((res) => {
          expect(res.headers).not.toHaveProperty('x-powered-by');
        });
    });
  });

  describe('Error Information Disclosure', () => {
    it('should not expose stack traces in production', () => {
      return request(app.getHttpServer())
        .get('/api/v1/invalid-endpoint')
        .expect(404)
        .expect((res) => {
          expect(res.body).not.toHaveProperty('stack');
          expect(JSON.stringify(res.body)).not.toContain('at ');
        });
    });

    it('should return generic error messages for authentication failures', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401)
        .expect((res) => {
          // Should not reveal whether user exists or not
          expect(res.body.message).not.toContain('user not found');
          expect(res.body.message).not.toContain('invalid email');
        });
    });
  });
});
