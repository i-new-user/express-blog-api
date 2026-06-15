import { Request, Response } from 'express';
import { testingRepository } from './testing.repository';

export const testingController = {
  async clearAllData(_req: Request, res: Response): Promise<void> {
    await testingRepository.clearAllData();

    res.sendStatus(204);
  },
};