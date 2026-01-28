import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Voice Interview Sessions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('api/v1');

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up previous sessions and users with the test email
    await prisma.voiceInterviewSession.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { contains: 'setup-test' } } });

    // Create user and get token
    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'setup-test@example.com',
        password: 'Test123!@#',
        firstName: 'Setup',
        lastName: 'Test',
        role: 'JOB_SEEKER',
      })
      .expect(201);

    token = registerRes.body.data.accessToken;
  });

  it('should create a session on setup and persist it', async () => {
    const payload = {
      cvData: { name: 'Test CV' },
      jobDescription: { title: 'Test Job', description: 'This is a test job description' },
    };

    // Call setup endpoint
    const res = await request(app.getHttpServer())
      .post('/api/v1/voice-interviews/setup')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    expect(res.body.data).toHaveProperty('sessionId');
    expect(res.body.data).toHaveProperty('streamUrl');

    const sessionId = res.body.data.sessionId;
    // Check DB record exists
    const session = await prisma.voiceInterviewSession.findUnique({
      where: { sessionId },
    });
    expect(session).not.toBeNull();
    expect(session.cv).toBeDefined();
    expect(session.jobDescription).toBeDefined();
  });
});
