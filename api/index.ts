import { app } from '../src/app/app';
import { connectToMongo } from '../src/db/mongo-client';

let isConnected = false;

const ensureDbConnection = async (): Promise<void> => {
  if (!isConnected) {
    await connectToMongo();
    isConnected = true;
  }
};

export default async function handler(req: any, res: any) {
  await ensureDbConnection();

  return app(req, res);
}