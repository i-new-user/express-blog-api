import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

dotenv.config({ path: envFile });

type RequiredEnvironmentVariable =
  | 'MONGO_URL'
  | 'DB_NAME'
  | 'ADMIN_LOGIN'
  | 'ADMIN_PASSWORD'
  | 'ACCESS_TOKEN_SECRET';

const requireEnvironmentVariable = (
  name: RequiredEnvironmentVariable,
): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  mongoUrl: requireEnvironmentVariable('MONGO_URL'),
  dbName: requireEnvironmentVariable('DB_NAME'),
  adminLogin: requireEnvironmentVariable('ADMIN_LOGIN'),
  adminPassword: requireEnvironmentVariable('ADMIN_PASSWORD'),
  accessTokenSecret: requireEnvironmentVariable('ACCESS_TOKEN_SECRET'),
  accessTokenExpiresIn: '5m',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  emailFrom: process.env.EMAIL_FROM || 'autotest test',
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: Number(process.env.EMAIL_PORT) || 587,
};
