import { Server } from 'http';
import { app } from './app/app';
import { env } from './config/env';
import { closeMongoConnection, connectToMongo } from './db/mongo-client';

let server: Server | null = null;

const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`${signal} received. Shutting down...`);

  if (!server) {
    await closeMongoConnection();
    process.exit(0);
  }

  server.close(async () => {
    await closeMongoConnection();
    console.log('Application stopped');
    process.exit(0);
  });
};

const bootstrap = async (): Promise<void> => {
  try {
    await connectToMongo();

    server = app.listen(env.port, () => {
      console.log(`Server started on port ${env.port}`);
    });

    process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start application:', error);
    await closeMongoConnection();
    process.exit(1);
  }
};

void bootstrap();
