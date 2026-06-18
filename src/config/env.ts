import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

dotenv.config({ path: envFile });

const requiredEnv = [
  'MONGO_URL',
  'DB_NAME',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'ADMIN_LOGIN',
  'ADMIN_PASSWORD',
] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isTest: process.env.NODE_ENV === 'test',
  isProduction: process.env.NODE_ENV === 'production',

  port: Number(process.env.PORT) || 3000,

  mongoUrl: process.env.MONGO_URL as string,
  dbName: process.env.DB_NAME as string,

  adminLogin: process.env.ADMIN_LOGIN as string,
  adminPassword: process.env.ADMIN_PASSWORD as string,

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET as string,

  // ВАЖНО:
  // Для Homework 11 access token должен жить достаточно долго,
  // иначе длинные сценарии лайков падают с 401.
  accessTokenExpiresIn: '5m',

  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET as string,
  refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES || '20s',

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  emailFrom: process.env.EMAIL_FROM || 'autotest test',
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: Number(process.env.EMAIL_PORT) || 587,
};