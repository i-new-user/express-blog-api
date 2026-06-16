import { getDb } from '../../db/mongo-client';

/**
 * TestingRepository нужен только для тестов и разработки.
 *
 * Его задача — полностью очищать коллекции.
 *
 * В production такие endpoints обычно:
 * - либо вообще отключают
 * - либо защищают отдельно
 */
export const testingRepository = {
  async clearAllData(): Promise<void> {
    const db = getDb();

    await Promise.all([
      db.collection('blogs').deleteMany({}),
      db.collection('posts').deleteMany({}),
      db.collection('users').deleteMany({}),
      db.collection('comments').deleteMany({}),
      db.collection('securityDevices').deleteMany({}),
    ]);
  },
};