import { Router } from 'express';
import { env } from '../../config/env';
import { testingController } from './testing.controller';
import { asyncHandler } from '../../common/helpers/async-handler';

export const testingRouter = Router();

testingRouter.delete('/all-data', asyncHandler(testingController.clearAllData));