import mongoose from 'mongoose';

import { env } from '../config/env';

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectToMongo = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.mongoUrl, {
      dbName: env.dbName,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      maxPoolSize: 10,
      autoIndex: true,
    });
  }

  await connectionPromise;

  if (!env.isTest) {
    console.log(`Connected to MongoDB database: ${env.dbName}`);
  }
};

export const getMongooseConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB is not connected');
  }

  return mongoose.connection;
};

export const closeMongoConnection = async (): Promise<void> => {
  await mongoose.disconnect();
  connectionPromise = null;
};
