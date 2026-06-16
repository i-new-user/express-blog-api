import { Request, Response } from 'express';
import { testingRepository } from './testing.repository';
import { clearRateLimitAttempts } from '../../common/middlewares/rate-limit.middleware';

export const testingController = {
  async clearAllData(_req: Request, res: Response): Promise<void> {
    await testingRepository.clearAllData();

    clearRateLimitAttempts();

    res.sendStatus(204);
  },
};