
import { Db, MongoClient } from 'mongodb';
import mongoose from 'mongoose';

import { env } from '../config/env';
import { createMongoIndexes } from './mongo-indexes';

export const mongoClient = new MongoClient(env.mongoUrl, {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
  socketTimeoutMS: 3000,
  maxPoolSize: 10,
});

let db: Db | null = null;
let connectionPromise: Promise<void> | null = null;

export const connectToMongo = async (): Promise<void> => {
  if (db && mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    connectionPromise = (async () => {
      await mongoClient.connect();

      db = mongoClient.db(env.dbName);

      await mongoose.connect(env.mongoUrl, {
        dbName: env.dbName,
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
        socketTimeoutMS: 3000,
        maxPoolSize: 10,
        autoIndex: !env.isTest,
      });

      if (!env.isTest) {
        await createMongoIndexes(db);
        console.log(`Connected to MongoDB database: ${env.dbName}`);
      }
    })();
  }

  await connectionPromise;
};

export const getDb = (): Db => {
  if (!db) {
    throw new Error('MongoDB is not connected');
  }

  return db;
};

export const getMongooseConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB is not connected');
  }

  return mongoose.connection;
};

export const closeMongoConnection = async (): Promise<void> => {
  await mongoose.disconnect();
  await mongoClient.close();

  db = null;
  connectionPromise = null;
};



































// // import { Db, MongoClient } from 'mongodb';
// import mongoose, {Schema, model} from 'mongoose';

// import { env } from '../config/env';
// // import { createMongoIndexes } from './mongo-indexes';

// // export const mongoClient = new MongoClient(env.mongoUrl, {
// //   serverSelectionTimeoutMS: 3000,
// //   connectTimeoutMS: 3000,
// //   socketTimeoutMS: 3000,
// //   maxPoolSize: 10,
// // });

// // let db: Db | null = null;





// let connectionPromise: Promise<typeof mongoose> | null = null;

// export const connectToMongo = async (): Promise<void> => {
//   if (mongoose.connection.readyState === 1) return;

//   if (!connectionPromise) {
//     connectionPromise = mongoose.connect(env.mongoUrl, {
//       dbName: env.dbName,
//       serverSelectionTimeoutMS: 3000,
//       connectTimeoutMS: 3000,
//       socketTimeoutMS: 3000,
//       maxPoolSize: 10,
//       autoIndex: !env.isTest,
//     });
//   }

//   await connectionPromise;

//   // Если индексы теперь описаны в Mongoose-схемах,
//   // отдельно createMongoIndexes(db) больше не нужен.
//   //
//   // if (!env.isTest) {
//   //   await createMongoIndexes(db);
//   // }

//   if (!env.isTest) {
//     console.log(`Connected to MongoDB database: ${env.dbName}`);
//   }
// };

// // export const getDb = (): Db => {
// //   if (!db) {
// //     throw new Error('MongoDB is not connected');
// //   }
// //
// //   return db;
// // };

// export const getMongooseConnection = () => {
//   if (mongoose.connection.readyState !== 1) {
//     throw new Error('MongoDB is not connected');
//   }

//   return mongoose.connection;
// };

// export const closeMongoConnection = async (): Promise<void> => {
//   await mongoose.disconnect();

//   // db = null;
//   connectionPromise = null;
// };