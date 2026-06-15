import { app } from './app/app';
import { env } from './config/env';
import { connectToMongo } from './db/mongo-client';

app.listen(env.port, () => {
  console.log(`Server started on port ${env.port}`);

  connectToMongo().catch((error) => {
    console.error('MongoDB connection failed:', error);
  });
});