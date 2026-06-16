import { app } from './app/app';
import { env } from './config/env';
import { closeMongoConnection, connectToMongo } from './db/mongo-client';

const bootstrap = async (): Promise<void> => {
  try {
    await connectToMongo();

    app.listen(env.port, () => {
      console.log(`Server started on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start application:', error);

    await closeMongoConnection();

    process.exit(1);
  }
};

void bootstrap();