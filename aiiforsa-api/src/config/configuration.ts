export const configuration = () => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE || '10485760', 10), // 10MB default
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10), // 30s default
  },
  database: {
    url: process.env.DATABASE_URL,
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    connectionTimeout: parseInt(
      process.env.DB_CONNECTION_TIMEOUT || '5000',
      10,
    ),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expirationTime: process.env.JWT_EXPIRATION_TIME || '15m', // Reduced for security
    refreshExpirationTime: process.env.JWT_REFRESH_EXPIRATION_TIME || '7d',
    issuer: process.env.JWT_ISSUER || 'aiiforsa-api',
    audience: process.env.JWT_AUDIENCE || 'aiiforsa-app',
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM,
    secure: process.env.MAIL_SECURE === 'true',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    // Advanced rate limiting
    shortTtl: parseInt(process.env.THROTTLE_SHORT_TTL || '1', 10), // 1 second
    shortLimit: parseInt(process.env.THROTTLE_SHORT_LIMIT || '10', 10),
    mediumTtl: parseInt(process.env.THROTTLE_MEDIUM_TTL || '10', 10), // 10 seconds
    mediumLimit: parseInt(process.env.THROTTLE_MEDIUM_LIMIT || '50', 10),
    longTtl: parseInt(process.env.THROTTLE_LONG_TTL || '60', 10), // 60 seconds
    longLimit: parseInt(process.env.THROTTLE_LONG_LIMIT || '100', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10), // 1 hour default
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  },
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900', 10), // 15 minutes
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600', 10), // 1 hour
  },
});
