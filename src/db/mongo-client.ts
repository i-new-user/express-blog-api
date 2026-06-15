import { Db, MongoClient } from 'mongodb';
import { env } from '../config/env';

/**
 * MongoDB подключаем один раз при старте приложения.
 *
 * Важно:
 * - MongoClient нельзя создавать на каждый запрос
 * - подключение должно быть singleton
 * - коллекции позже будем брать из db
 */

export const mongoClient = new MongoClient(env.mongoUrl);

let db: Db | null = null;

export const connectToMongo = async (): Promise<void> => {
  await mongoClient.connect();

  db = mongoClient.db(env.dbName);

  console.log(`✅ Connected to MongoDB database: ${env.dbName}`);
};

export const getDb = (): Db => {
  if (!db) {
    throw new Error('MongoDB is not connected');
  }

  return db;
};

export const closeMongoConnection = async (): Promise<void> => {
  await mongoClient.close();
  db = null;
};