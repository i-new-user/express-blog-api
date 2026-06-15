import { Router } from 'express';
import { env } from '../../config/env';
import { testingController } from './testing.controller';
import { asyncHandler } from '../../common/helpers/async-handler';

export const testingRouter = Router();

testingRouter.delete(
  '/all-data',
  (req, res, next) => {
    if (env.isProduction) {
      res.sendStatus(404);
      return;
    }

    next();
  },
  asyncHandler(testingController.clearAllData),
);