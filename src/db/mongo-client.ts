import { Db, MongoClient } from 'mongodb';
import { env } from '../config/env';
// import { createMongoIndexes } from './mongo-indexes';

export const mongoClient = new MongoClient(env.mongoUrl, {
  serverSelectionTimeoutMS: 3000,
  maxPoolSize: 10,
});

let db: Db | null = null;
let connectionPromise: Promise<void> | null = null;

export const connectToMongo = async (): Promise<void> => {
  if (db) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoClient.connect().then(async () => {
      db = mongoClient.db(env.dbName);

      // await createMongoIndexes(db);

      if (!env.isTest) {
        console.log(`Connected to MongoDB database: ${env.dbName}`);
      }
    });
  }

  await connectionPromise;
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
  connectionPromise = null;
};