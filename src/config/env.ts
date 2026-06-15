import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

dotenv.config({
  path: envFile,
});

const requiredEnv = ['MONGO_URL', 'DB_NAME', 'ACCESS_TOKEN_SECRET'] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',

  port: Number(process.env.PORT) || 3000,

  mongoUrl: process.env.MONGO_URL as string,
  dbName: process.env.DB_NAME as string,

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '10m',

  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '',
  refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES || '20s',

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  isTest: process.env.NODE_ENV === 'test',

  EMAIL_FROM: process.env.EMAIL_FROM || 'autotest test',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || '587',
};