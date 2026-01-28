# AIIFORSA API

A production-ready, enterprise-grade NestJS API with TypeScript, Prisma, PostgreSQL, Redis, comprehensive security features, and scalable architecture for SaaS applications.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: JWT-based auth with role-based access control (RBAC)
- **Database**: Prisma ORM with PostgreSQL and connection pooling
- **Caching**: Redis integration for sessions and rate limiting
- **Email Service**: Nodemailer with HTML templates and variable substitution
- **API Documentation**: Swagger/OpenAPI 3.0
- **Logging**: Request/response logging with custom interceptors
- **Error Handling**: Global exception filters with production-aware error messages
- **Environment Configuration**: Centralized config management with validation

### Security Features (Production-Ready)
- **HTTP Security Headers**: Helmet with CSP, HSTS, XSS protection, frameguard
- **CORS Protection**: Advanced origin validation with callback
- **Multi-Tier Rate Limiting**: Short-term, medium-term, and long-term throttling
- **Input Validation**: DTO validation with class-validator and sanitization
- **Password Security**: bcrypt with configurable salt rounds (12 by default)
- **JWT Security**: Secure token handling with expiration and refresh tokens
- **Graceful Shutdown**: SIGTERM/SIGINT handlers with cleanup
- **Error Sanitization**: Production mode hides sensitive error details
- **Request Timeout**: Configurable timeout protection (30s default)

### Performance Optimizations
- **Database Connection Pooling**: Configurable min/max connections
- **Redis Caching**: LRU eviction policy with persistence
- **Compression**: Gzip compression (level 6)
- **Query Optimization**: Prisma query optimization with select/include
- **Response Transformation**: Efficient data serialization
- **HTTP/2 Support**: Via Nginx reverse proxy
- **Static File Caching**: Long-term caching for assets

## 📁 Project Structure

```
aiiforsa-api/
├── prisma/                         # Database schema and migrations
│   ├── schema.prisma              # Prisma schema (User, Resume, Interview, Job, etc.)
│   ├── seed.ts                    # Database seeding script
│   └── migrations/                # Version-controlled migrations
├── src/
│   ├── common/                    # Shared utilities and cross-cutting concerns
│   │   ├── decorators/           # Custom decorators (@Public, @Roles, @CurrentUser)
│   │   ├── dto/                  # Shared DTOs
│   │   ├── filters/              # Global exception filters
│   │   ├── guards/               # Auth guards (JWT, Roles)
│   │   ├── interceptors/         # Logging & transform interceptors
│   │   ├── interfaces/           # Shared TypeScript interfaces
│   │   ├── pipes/                # Custom validation pipes
│   │   └── utils/                # Utility functions
│   ├── config/                    # Configuration management
│   │   ├── configuration.ts      # Centralized config (60+ parameters)
│   │   └── validation.ts         # Environment validation schema
│   ├── database/                  # Database integration
│   │   ├── prisma.service.ts     # Prisma client wrapper
│   │   └── prisma.module.ts      # Prisma module
│   ├── modules/                   # Feature modules (business logic)
│   │   ├── auth/                 # Authentication & authorization
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/              # Auth DTOs (login, register, refresh)
│   │   │   └── strategies/       # JWT strategies
│   │   ├── user/                 # User management
│   │   ├── resume/               # CV/Resume management with file upload
│   │   ├── interview/            # Interview scheduling and management
│   │   ├── job/                  # Job listings
│   │   ├── job-application/      # Job application tracking
│   │   ├── jobrecommendation/    # AI-powered job recommendations
│   │   ├── community/            # Community features
│   │   ├── mailer/               # Email service with templates
│   │   ├── redis/                # Redis caching service
│   │   └── health/               # Health check endpoint
│   ├── app.module.ts              # Root application module
│   └── main.ts                    # Application bootstrap (191 lines)
├── templates/
│   └── email/                     # HTML email templates
│       ├── welcome.html
│       └── password-reset.html
├── test/                          # Test suites
│   ├── *.e2e-spec.ts             # End-to-end tests
│   ├── factories/                # Test data factories
│   └── setup.ts                  # Test environment setup
├── scripts/                       # Utility scripts
├── docker-compose.yml            # Development environment
├── .env.example                  # Development environment template
└── README.md                     # This file
```

## 🐳 Quick Start with Docker

### Prerequisites

- Docker and Docker Compose
- Node.js (v16 or higher) - optional, for local development
- npm or yarn package manager

### 1. Start Database Services

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Services will be available at:
# - PostgreSQL: localhost:5432
# - pgAdmin: http://localhost:5050 (admin@aiiforsa.com / admin123)
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment variables:

```bash
cp .env.example .env
```

The `.env` file is already configured for Docker PostgreSQL.

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed the database with test data
npm run prisma:seed
```

### 5. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`
Swagger documentation at `http://localhost:3000/api/docs`

## 🖥️ Manual Setup (without Docker)

If you prefer to set up PostgreSQL manually:

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Update `.env` file with your PostgreSQL connection:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/aiiforsa_db?schema=public"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed the database with test data
npm run prisma:seed
```

### 4. Start the Application

```bash
# Development mode
npm run start:dev
```

## 📚 API Endpoints

### Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://yourdomain.com/api/v1`
- **Swagger Docs**: `http://localhost:3000/api/docs` (development only)

### Health & Status
- `GET /api/v1/health` - Health check endpoint (no auth required)

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login (rate limited: 5 req/min)
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### Users (Protected)
- `GET /api/v1/users` - Get all users (Admin/Moderator only)
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user (Admin only)
- `PATCH /api/v1/users/:id` - Update user
- `PATCH /api/v1/users/me` - Update current user profile
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Resumes/CVs (Protected)
- `POST /api/v1/resume` - Create new resume (JSON body)
- `GET /api/v1/resume` - List all user's resumes
- `GET /api/v1/resume/:id` - Get specific resume by ID
- `PUT /api/v1/resume/:id` - Update resume data
- `DELETE /api/v1/resume/:id` - Delete resume and file
- `POST /api/v1/resume/:id/upload` - Upload CV file (PDF/DOC/DOCX, max 10MB)
- `GET /api/v1/resume/:id/download` - Download CV file
- `POST /api/v1/resume/:id/parse` - Parse CV with AI
- `GET /api/v1/resume/:id/suggestions` - Get CV improvement suggestions
- `POST /api/v1/resume/:id/share` - Generate shareable link
- `GET /api/v1/resume/shared/:shareToken` - View shared resume (public)

### Interviews (Protected)
- `POST /api/v1/interview` - Schedule new interview
- `GET /api/v1/interview` - List user's interviews
- `GET /api/v1/interview/:id` - Get interview details
- `PATCH /api/v1/interview/:id` - Update interview
- `DELETE /api/v1/interview/:id` - Cancel interview
- `POST /api/v1/interview/:id/feedback` - Submit interview feedback

### Jobs (Public/Protected)
- `GET /api/v1/jobs` - List all jobs (public)
- `GET /api/v1/jobs/:id` - Get job details (public)
- `POST /api/v1/jobs` - Create job posting (Admin/Recruiter)
- `PATCH /api/v1/jobs/:id` - Update job (Admin/Recruiter)
- `DELETE /api/v1/jobs/:id` - Delete job (Admin/Recruiter)
- `GET /api/v1/jobs/search` - Search jobs with filters

### Job Applications (Protected)
- `POST /api/v1/job-application` - Apply to job
- `GET /api/v1/job-application` - List user's applications
- `GET /api/v1/job-application/:id` - Get application details
- `PATCH /api/v1/job-application/:id` - Update application status
- `DELETE /api/v1/job-application/:id` - Withdraw application

### Job Recommendations (Protected)
- `GET /api/v1/jobrecommendation` - Get personalized job recommendations
- `POST /api/v1/jobrecommendation/refresh` - Refresh recommendations

### Community (Protected)
- `GET /api/v1/community` - List community posts
- `POST /api/v1/community` - Create community post
- `GET /api/v1/community/:id` - Get post details
- `PATCH /api/v1/community/:id` - Update post
- `DELETE /api/v1/community/:id` - Delete post
- `POST /api/v1/community/:id/comment` - Add comment to post

## 🔐 Authentication & Authorization

### JWT Authentication
The API uses JWT (JSON Web Tokens) for stateless authentication. After logging in, include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Token Configuration
- **Access Token Expiration**: 15 minutes (production) / 1 hour (development)
- **Refresh Token Expiration**: 7 days
- **JWT Algorithm**: HS256
- **Token Includes**: User ID, email, role, issued at, expiration

### User Roles & Permissions
- **ADMIN**: Full system access, user management, job posting
- **RECRUITER**: Job posting, application management, interview scheduling
- **MODERATOR**: Content moderation, community management
- **USER**: Standard user access, job applications, resume management

### Default Users (Development - if seeded)
- **Admin**: admin@aiiforsa.com / admin123456
- **User**: user@aiiforsa.com / user123456

### Password Requirements
- Minimum 8 characters
- bcrypt hashing with 12 salt rounds
- Maximum login attempts: 5
- Account lockout duration: 15 minutes

## 🚦 Rate Limiting

The API implements **multi-tier rate limiting** to protect against abuse:

### Development Environment
- **Short-term**: 10 requests per second
- **Medium-term**: 50 requests per 10 seconds
- **Long-term**: 100 requests per minute

### Production Environment
- **Short-term**: 5 requests per second (configurable)
- **Medium-term**: 30 requests per 10 seconds (configurable)
- **Long-term**: 100 requests per minute (configurable)

### Special Rate Limits
- **Authentication endpoints** (login, register): 5 requests per minute
- **Health check endpoint**: Exempt from rate limiting
- **User-agent filtering**: Health check bots are exempt

### Rate Limit Headers
All responses include rate limit information:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1623456789
```

### Rate Limit Exceeded Response
```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "ThrottlerException"
}
```

## 📧 Email Service

The mailer service supports:
- HTML email templates with variable substitution
- Welcome emails
- Password reset emails

Templates are located in `templates/email/`

## 🔒 Security Features

### HTTP Security Headers (Helmet)
Production-grade security headers configured via Helmet:

- **Content-Security-Policy (CSP)**: Prevents XSS attacks
  - `default-src 'self'`
  - `script-src 'self'`
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' data: https:`

- **Strict-Transport-Security (HSTS)**: Forces HTTPS
  - `max-age=31536000` (1 year)
  - `includeSubDomains`
  - `preload`

- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-Content-Type-Options**: `nosniff` - Prevents MIME sniffing
- **X-XSS-Protection**: `1; mode=block` - XSS filter
- **Referrer-Policy**: `strict-origin-when-cross-origin`

### CORS (Cross-Origin Resource Sharing)
Advanced CORS configuration with origin validation:

```typescript
// Development: Allow all origins
origin: true

// Production: Callback-based origin validation
origin: (origin, callback) => {
  const allowedOrigins = process.env.CORS_ORIGIN.split(',');
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    logger.warn(`Blocked CORS request from: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  }
}
```

**Allowed Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS  
**Allowed Headers**: Content-Type, Authorization, Accept  
**Credentials**: Enabled for cookie-based auth

### Input Validation & Sanitization
- **class-validator**: DTO-based validation for all inputs
- **class-transformer**: Automatic type transformation
- **Whitelist**: `whitelist: true` - Strips unknown properties
- **Forbid Non-Whitelisted**: `forbidNonWhitelisted: true`
- **Transform**: `transform: true` - Auto type conversion
- **Max Upload Size**: 10MB for file uploads

### Password Security
- **Hashing Algorithm**: bcrypt
- **Salt Rounds**: 12 (configurable via `BCRYPT_ROUNDS`)
- **Password Strength**: Validated via DTO rules
- **Login Attempt Tracking**: Max 5 attempts
- **Account Lockout**: 15 minutes after max attempts

### JWT Security
- **Strong Secret**: 32+ character random secret required
- **Short Expiration**: 15 minutes for access tokens
- **Refresh Tokens**: 7 days expiration
- **Token Validation**: Signature verification on every request
- **Issuer/Audience**: Configured for additional validation

### Rate Limiting
See [Rate Limiting](#-rate-limiting) section above.

### Error Handling
- **Production Mode**: Hides sensitive error details
- **Development Mode**: Full error stack traces
- **Global Exception Filter**: Consistent error format
- **Logging**: All errors logged with context

### Database Security
- **Connection Pooling**: Prevents connection exhaustion
  - Min connections: 2
  - Max connections: 10
  - Connection timeout: 30 seconds
- **Parameterized Queries**: Prisma prevents SQL injection
- **SSL/TLS**: Supported for production databases

### Redis Security
- **Password Authentication**: Required via `REDIS_PASSWORD`
- **Connection Timeout**: 300 seconds
- **Max Memory**: 512MB with LRU eviction
- **Persistence**: RDB + AOF for data durability

### Graceful Shutdown
Application handles shutdown signals properly:
- **SIGTERM**: Graceful shutdown with cleanup
- **SIGINT**: Interrupt signal handling
- **Uncaught Exceptions**: Logged and handled
- **Unhandled Rejections**: Logged and handled

### Additional Security Measures
- **Request Timeout**: 30 seconds maximum
- **Compression**: Enabled with filtering
- **No Swagger in Production**: API docs disabled
- **Environment Validation**: Required variables checked at startup
- **Secure Headers**: Additional security headers in responses

## 🧪 Testing

### Test Suites
The application includes comprehensive test coverage:

#### Unit Tests
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Debug tests
npm run test:debug
```

**Current Status**: 178/178 tests passing (100%)

#### End-to-End (E2E) Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suite
npm run test:e2e:auth      # Authentication tests (15 tests)
npm run test:e2e:security  # Security tests (26 tests)

# Run all tests (unit + E2E)
npm run test:all
```

**E2E Test Coverage**:
- ✅ Authentication flow (register, login, logout, refresh)
- ✅ Authorization and role-based access
- ✅ User management endpoints
- ✅ Resume/CV operations
- ⚠️ Security features (rate limiting, CORS, headers)
- ⚠️ Performance benchmarks

#### Performance/Load Tests
```bash
# Basic load test
npm run test:load

# Health endpoint load test (100 concurrent, 30s)
npm run test:load:health

# Jobs endpoint load test
npm run test:load:jobs

# Stress test (500 concurrent, 60s)
npm run test:stress
```

**Prerequisites**: Install `autocannon` for load testing
```bash
npm install -g autocannon
```

### Test Structure
```
test/
├── app.e2e-spec.ts           # Application-wide E2E tests
├── auth.e2e-spec.ts          # Authentication E2E tests ✅
├── security.e2e-spec.ts      # Security feature tests ⚠️
├── performance/              # Load and stress tests
├── factories/                # Test data factories
│   └── user.factory.ts      # User test data generation
├── setup.ts                  # Global test setup
└── jest-e2e.json            # E2E Jest configuration
```

### Test Configuration

**jest.config.json** (Unit Tests):
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

**jest-e2e.json** (E2E Tests):
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "testEnvironment": "node"
}
```

### Test Environment Setup
Tests use a separate test database to avoid contaminating development data:
- **Test Database**: Automatically created and migrated
- **Factories**: Generate consistent test data
- **Cleanup**: Database reset after each test suite
- **Isolation**: Each test runs in isolation

### Coverage Goals
- **Unit Tests**: > 80% coverage
- **E2E Tests**: All critical user flows
- **Integration Tests**: All external service interactions
- **Security Tests**: All security features validated

### Continuous Testing
```bash
# Watch mode for development
npm run test:watch

# Run tests before commit (recommended)
npm run test:all
```

### Test Documentation
For detailed testing guidelines, see:
- `test_guide.md` - Comprehensive testing documentation
- `TESTING_STRATEGY.md` - Testing strategy and best practices

## 📊 Database Management

### Prisma ORM
The application uses Prisma as the database ORM with PostgreSQL.

#### Database Schema
**Core Models**:
- **User**: Authentication and user profiles (email, password, role, profile)
- **Resume**: CV/Resume management with file storage
- **Interview**: Interview scheduling and management
- **Job**: Job listings with requirements and descriptions
- **JobApplication**: Job application tracking
- **Community**: Community posts and discussions
- **RefreshToken**: JWT refresh token storage

#### Prisma Commands

```bash
# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only - deletes all data)
npx prisma migrate reset

# Seed database with test data
npm run prisma:seed

# View migration status
npx prisma migrate status

# Format schema file
npx prisma format
```

### Database Configuration

#### Connection String Format
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA&connection_limit=LIMIT
```

#### Development (Docker)
```env
DATABASE_URL="postgresql://aiiforsa_user:aiiforsa_password@localhost:5432/aiiforsa_db?schema=public"
```

#### Production Configuration
```env
DATABASE_URL="postgresql://user:password@production-host:5432/db?schema=public&connection_limit=10&pool_timeout=30&sslmode=require"
```

### Connection Pooling
Optimized for performance and resource management:

```typescript
// Configuration in src/config/configuration.ts
database: {
  url: process.env.DATABASE_URL,
  poolMin: parseInt(process.env.DB_POOL_MIN, 10) || 2,
  poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 10,
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 30000,
}
```

**Production Settings**:
- `DB_POOL_MIN=2` - Minimum connections
- `DB_POOL_MAX=10` - Maximum connections
- `DB_CONNECTION_TIMEOUT=30000` - Connection timeout (30s)

### Migrations
Version-controlled database changes:

```
prisma/migrations/
├── 20251009163522_efaegaeg/
├── 20251013143921_ajfbae/
├── 20251104133840_add_interview_models/
├── 20251105122828_update_user_schema/
├── 20251111085401_cv/
├── 20251111094522_rename_cv_name_to_user_name/
├── 20251112132804_add_cv_parsed_field/
├── 20251113213244_/
├── 20251114000648_add_cv_sections_and_suggestions/
├── 20251114005127_rename_cv_to_resume/
└── 20251114141754_add_resume_sharing_features/
```

### Database Best Practices
- ✅ Use migrations for all schema changes
- ✅ Never edit migration files manually
- ✅ Test migrations in development first
- ✅ Backup database before production migrations
- ✅ Use transactions for complex operations
- ✅ Add indexes for frequently queried fields
- ✅ Use select/include to fetch only needed data
- ✅ Implement soft deletes for critical data

## 🏗️ Development Best Practices

### Code Organization
- **Feature-based module structure**: Each module is self-contained with controller, service, DTOs
- **Shared utilities in `common/`**: Reusable decorators, guards, filters, pipes
- **Dependency Injection**: NestJS DI container for loose coupling
- **Environment-specific configurations**: Separate configs for dev/test/prod
- **Comprehensive error handling**: Global exception filters with context
- **TypeScript strict mode**: Type safety throughout the application
- **ESLint + Prettier**: Consistent code formatting and linting

### Architecture Patterns
- **Repository Pattern**: Prisma service acts as repository layer
- **Service Layer**: Business logic separated from controllers
- **DTO Pattern**: Data Transfer Objects for all inputs/outputs
- **Guard Pattern**: Authentication and authorization via guards
- **Interceptor Pattern**: Cross-cutting concerns (logging, transformation)
- **Module Pattern**: Encapsulation of related features

### Security Best Practices
- ✅ Input validation on all endpoints (DTO validation)
- ✅ Role-based access control (RBAC with guards)
- ✅ Secure password handling (bcrypt with 12 rounds)
- ✅ Rate limiting protection (multi-tier throttling)
- ✅ SQL injection prevention (Prisma parameterized queries)
- ✅ XSS prevention (input sanitization + CSP headers)
- ✅ CSRF protection (SameSite cookies when used)
- ✅ Security headers (Helmet configuration)
- ✅ Environment variable validation (Joi schema)
- ✅ Sensitive data exclusion (password never returned in responses)

### Performance Best Practices
- ✅ Database connection pooling (min: 2, max: 10)
- ✅ Redis caching for frequently accessed data
- ✅ Efficient Prisma queries (select only needed fields)
- ✅ Response compression (Gzip level 6)
- ✅ Request/response transformation
- ✅ Lazy module loading where applicable
- ✅ Query result pagination
- ✅ Index optimization in database schema

### Code Quality
- **TypeScript**: Strict type checking enabled
- **Linting**: ESLint with recommended rules
- **Formatting**: Prettier for consistent code style
- **Testing**: Jest for unit and E2E tests
- **Documentation**: JSDoc comments for complex functions
- **Git Hooks**: Pre-commit hooks for linting and testing (recommended)

### API Design Principles
- **RESTful conventions**: Standard HTTP methods and status codes
- **Versioning**: API versioned via `/api/v1` prefix
- **Consistent response format**: All responses follow same structure
- **Error responses**: Standardized error format
- **Swagger documentation**: Auto-generated from decorators
- **Pagination**: Limit/offset pagination for list endpoints
- **Filtering**: Query parameters for filtering and sorting

## 🤝 Team Development

### Getting Started for Team Members

1. Clone the repository
2. Start database services: `docker-compose up -d`
3. Install dependencies: `npm install`
4. Set up environment variables (copy from team lead)
5. Run database migrations: `npm run prisma:migrate`
6. Start development server: `npm run start:dev`

### Code Standards
- TypeScript strict mode enabled
- ESLint and Prettier configured
- Comprehensive DTOs for all endpoints
- Swagger documentation for API endpoints

## ⚙️ Configuration Management

### Environment Variables
The application uses a centralized configuration system with validation.

#### Configuration Files
- `.env` - Development environment (git-ignored)
- `.env.example` - Development template (committed)
- `.env.production.example` - Production template (committed)

#### Configuration Categories

**Application Settings** (`src/config/configuration.ts`):
```typescript
app: {
  environment: 'development' | 'production' | 'test',
  port: 3000,
  apiPrefix: '/api/v1',
  maxUploadSize: 10485760, // 10MB
  requestTimeout: 30000, // 30s
}
```

**Database Settings**:
```typescript
database: {
  url: 'postgresql://...',
  poolMin: 2,
  poolMax: 10,
  connectionTimeout: 30000,
}
```

**JWT Settings**:
```typescript
jwt: {
  secret: 'strong-random-secret-32-chars-minimum',
  expirationTime: '15m', // Production: 15m, Dev: 1h
  refreshExpirationTime: '7d',
  issuer: 'aiiforsa-api',
  audience: 'aiiforsa-users',
}
```

**Redis Settings**:
```typescript
redis: {
  host: 'localhost',
  port: 6379,
  password: 'secure-password',
  ttl: 3600,
  maxRetriesPerRequest: 3,
}
```

**Security Settings**:
```typescript
security: {
  bcryptRounds: 12,
  maxLoginAttempts: 5,
  lockoutDuration: 900, // 15 minutes
  passwordMinLength: 8,
}
```

**Rate Limiting**:
```typescript
throttle: {
  shortLimit: 10, // requests
  shortTtl: 1000, // 1 second
  mediumLimit: 50,
  mediumTtl: 10000, // 10 seconds
  longLimit: 100,
  longTtl: 60000, // 1 minute
}
```

**Email Settings**:
```typescript
mail: {
  host: 'smtp.gmail.com',
  port: 587,
  secure: true,
  user: 'your-email@gmail.com',
  password: 'app-specific-password',
  from: 'AIIFORSA <noreply@aiiforsa.com>',
}
```

### Environment Validation
Configuration is validated at startup using Joi schema (`src/config/validation.ts`):

```typescript
validationSchema: Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  REDIS_PASSWORD: Joi.string().required(),
  // ... 60+ validated variables
})
```

**Benefits**:
- ✅ Early detection of configuration errors
- ✅ Type-safe configuration access
- ✅ Default values for optional settings
- ✅ Required vs optional validation
- ✅ Format validation (email, URL, number ranges)

### Accessing Configuration
```typescript
// In services/controllers
constructor(private configService: ConfigService) {}

// Get specific config value
const port = this.configService.get<number>('app.port');
const jwtSecret = this.configService.get<string>('jwt.secret');

// Get entire config section
const dbConfig = this.configService.get('database');
```

## 🐳 Docker & Containerization

### Development Environment
```bash
# Start all services (PostgreSQL + pgAdmin)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose build
```

**Services**:
- **PostgreSQL 16**: Database on port 5432
- **pgAdmin 4**: Web UI at http://localhost:5050
  - Email: admin@aiiforsa.com
  - Password: admin123

### Production Deployment

#### Production Docker Compose
Use `docker-compose.production.yml` for production:

```bash
# Build production images
docker-compose -f docker-compose.production.yml build

# Start production stack
docker-compose -f docker-compose.production.yml up -d

# View status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f api
```

**Production Stack**:
- **PostgreSQL 16 Alpine**: Optimized database with tuned parameters
- **Redis 7 Alpine**: Caching and session storage
- **API**: NestJS application with production optimizations
- **Nginx**: Reverse proxy with SSL/TLS termination

#### Production Dockerfile
Multi-stage build for optimized image size:

```dockerfile
# Builder stage: Dependencies + build
FROM node:20-alpine AS builder
# ... build steps

# Production stage: Minimal runtime
FROM node:20-alpine AS production
USER nestjs:1001  # Non-root user
# ... runtime setup
```

**Optimizations**:
- ✅ Multi-stage build (smaller final image)
- ✅ Non-root user for security
- ✅ Alpine Linux (minimal attack surface)
- ✅ dumb-init for proper signal handling
- ✅ Health check integration
- ✅ Production dependencies only

### Container Health Checks
```yaml
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:4050/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 🚀 Deployment

### Deployment Options

#### 1. Docker Compose (Recommended for small-medium deployments)
See Docker section above for details.

#### 2. Azure DevOps Pipeline (CI/CD)
Automated deployment to Azure Container Services using Azure DevOps.

**Features**:
- ✅ Automated testing (unit + E2E)
- ✅ Multi-stage Docker builds
- ✅ Azure Container Registry integration
- ✅ Development deployment (ACI)
- ✅ Production deployment (Container Apps)
- ✅ Health checks and rollbacks
- ✅ Environment-specific configurations

**Setup**: See `AZURE_DEVOPS_SETUP.md` for complete configuration guide.

**Pipeline Stages**:
1. **Build & Test**: Lint, unit tests, E2E tests, Docker build
2. **Deploy Dev**: Azure Container Instances (develop branch)
3. **Deploy Prod**: Azure Container Apps (main branch)
4. **Health Checks**: Automated post-deployment verification

#### 3. Kubernetes
Kubernetes manifests for scalable deployments (create separate k8s/ directory):
- Deployment
- Service
- Ingress
- ConfigMap
- Secrets
- HPA (Horizontal Pod Autoscaler)

#### 4. Cloud Platforms
- **AWS**: ECS, EKS, or Elastic Beanstalk
- **Azure**: App Service or AKS
- **Google Cloud**: Cloud Run or GKE
- **DigitalOcean**: App Platform or Kubernetes
- **Heroku**: Container deployment

### Pre-Deployment Checklist
See complete deployment guide for detailed checklist:

- [ ] SSL/TLS certificates obtained
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Database backups configured
- [ ] Monitoring setup (optional)
- [ ] Firewall rules configured
- [ ] CORS origins set correctly
- [ ] Rate limiting configured
- [ ] JWT secrets are strong and unique
- [ ] Redis password set
- [ ] Email service configured
- [ ] Health checks working
- [ ] All tests passing

### Deployment Process
```bash
# 1. Clone repository
git clone <repository-url>
cd aiiforsa-api

# 2. Configure environment
cp .env.production.example .env.production
# Edit .env.production with real values

# 3. Build production image
docker-compose -f docker-compose.production.yml build

# 4. Run database migrations
docker-compose -f docker-compose.production.yml run --rm api npx prisma migrate deploy

# 5. Start services
docker-compose -f docker-compose.production.yml up -d

# 6. Verify deployment
curl https://yourdomain.com/api/v1/health
```

## 📚 Documentation

### Available Documentation
- **README.md** (this file) - Complete technical overview
- **test_guide.md** - Testing documentation and strategy
- **TESTING_STRATEGY.md** - Detailed testing best practices
- **AZURE_DEVOPS_SETUP.md** - Complete Azure DevOps pipeline setup guide
- **src/modules/resume/CV_DATA_FLOW.md** - CV/Resume data flow
- **Swagger/OpenAPI** - Interactive API documentation (development only)
  - URL: http://localhost:3000/api/docs

### Pipeline Testing Script
Before deploying to Azure DevOps, validate your setup locally:

```bash
# Make script executable (first time only)
chmod +x test-pipeline.sh

# Run comprehensive pipeline validation
./test-pipeline.sh
```

**What it validates**:
- ✅ Dependencies (Node.js, Docker, Docker Compose)
- ✅ Node.js version compatibility
- ✅ Required files presence
- ✅ ESLint code quality
- ✅ Unit test execution
- ✅ Docker build process
- ✅ Docker Compose configuration
- ✅ Environment variables
- ✅ Azure Pipelines YAML syntax
- ✅ Basic security checks

### Code Documentation
- JSDoc comments for complex functions
- TypeScript interfaces for type safety
- DTO classes with validation decorators
- Inline comments for business logic

### API Documentation (Swagger)
Access Swagger UI in development:
```
http://localhost:3000/api/docs
```

Features:
- Interactive API testing
- Request/response schemas
- Authentication support (Bearer token)
- Example requests/responses
- Model definitions

**Note**: Swagger is disabled in production for security.

## 🔧 Customization & Extension

### Adding New Modules
1. Generate module using NestJS CLI:
```bash
nest generate module modules/feature-name
nest generate controller modules/feature-name
nest generate service modules/feature-name
```

2. Create DTOs in `modules/feature-name/dto/`
3. Add Prisma schema changes in `prisma/schema.prisma`
4. Generate migration: `npx prisma migrate dev --name add_feature`
5. Implement business logic in service
6. Add Swagger decorators for documentation

### Adding Custom Decorators
Create decorators in `src/common/decorators/`:
```typescript
// Example: @IpAddress() decorator
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.ip;
  },
);
```

### Adding Email Templates
1. Create HTML file in `templates/email/`
2. Use `{{variable}}` syntax for substitution
3. Call from MailerService:
```typescript
await this.mailerService.sendEmail(
  'user@example.com',
  'Subject',
  'template-name',
  { variable: 'value' }
);
```

### Adding Database Models
1. Update `prisma/schema.prisma`:
```prisma
model NewModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. Generate migration:
```bash
npx prisma migrate dev --name add_new_model
```

3. Generate Prisma Client:
```bash
npx prisma generate
```

## 🔍 Monitoring & Observability

### Health Checks
The `/api/v1/health` endpoint provides application health status:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Logging
- **Winston** (recommended for production): Structured logging with levels
- **Console**: Development logging
- **Log Levels**: error, warn, log, debug, verbose
- **Context**: Each log includes context (module, function)

### Recommended Monitoring Tools
- **Application Performance**: New Relic, Datadog, or Sentry
- **Infrastructure**: Prometheus + Grafana
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Uptime**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, Rollbar

### Metrics to Monitor
- Request rate (requests per second)
- Response time (p50, p95, p99)
- Error rate (% of requests)
- Database connection pool usage
- Redis memory usage
- CPU and memory usage
- Disk space
- Active connections

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and commit: `git commit -m 'Add amazing feature'`
4. Write/update tests
5. Ensure all tests pass: `npm run test:all`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open Pull Request

### Code Standards
- Follow existing code style
- Use TypeScript strict mode
- Add JSDoc comments for complex functions
- Write unit tests for services
- Write E2E tests for new endpoints
- Update Swagger documentation
- Update README if needed

### Commit Message Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
refactor: Refactor code
perf: Performance improvement
chore: Maintenance tasks
```

## 📝 Additional Notes

### Key Technologies
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Database ORM**: Prisma 6.19.0
- **Database**: PostgreSQL 16
- **Caching**: Redis 7 (ioredis 5.8.1)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Validation**: class-validator 0.14.2
- **Security**: Helmet 8.1.0
- **Rate Limiting**: @nestjs/throttler 6.4.0
- **Email**: Nodemailer 7.0.6
- **Documentation**: Swagger/OpenAPI

### Best Practices Implemented
✅ RESTful API conventions  
✅ Password hashing with bcrypt (12 rounds)  
✅ JWT with refresh tokens  
✅ Role-based access control (RBAC)  
✅ Input validation and sanitization  
✅ SQL injection prevention (Prisma)  
✅ XSS protection (CSP headers + input sanitization)  
✅ CSRF protection ready (SameSite cookies)  
✅ Rate limiting (multi-tier)  
✅ Security headers (Helmet)  
✅ Error handling (global filter)  
✅ Database migrations (versioned)  
✅ Connection pooling  
✅ Graceful shutdown  
✅ Health checks  
✅ Comprehensive testing  
✅ API documentation (Swagger)  
✅ Environment validation  
✅ Logging and monitoring ready  
✅ Docker containerization  
✅ Production optimizations  

### Support & Resources
- **NestJS Documentation**: https://docs.nestjs.com/
- **Prisma Documentation**: https://www.prisma.io/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Redis Documentation**: https://redis.io/documentation
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725

---

**Version**: 1.0.0  
**Last Updated**: November 2024  
**License**: UNLICENSED  
**Maintained by**: AIIFORSA Team

This setup provides a production-ready, enterprise-grade foundation for scalable SaaS applications with comprehensive security, performance optimizations, and modern development practices.
