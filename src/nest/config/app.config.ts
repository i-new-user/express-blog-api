import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

dotenv.config({ path: envFile });

const requireEnvironmentVariable = (name: 'MONGO_URL' | 'DB_NAME'): string => {
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
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
};
