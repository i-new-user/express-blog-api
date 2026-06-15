import { app } from './app/app';
import { env } from './config/env';
import { connectToMongo } from './db/mongo-client';

/**
 * bootstrap — точка входа в приложение.
 *
 * Здесь важно:
 * 1. сначала подключиться к MongoDB
 * 2. только потом запускать HTTP-сервер
 *
 * Иначе сервер может начать принимать запросы,
 * когда база ещё не готова.
 */

const bootstrap = async (): Promise<void> => {
  try {
    await connectToMongo();

    app.listen(env.port, () => {
      console.log(`🚀 Server started on port ${env.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
};

void bootstrap();