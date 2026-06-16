import { Router } from 'express';
import { securityController } from './security.controller';
import { refreshTokenMiddleware } from '../auth/guards/refresh-token.middleware';

export const securityRouter = Router();

securityRouter.get(
  '/devices',
  refreshTokenMiddleware,
  securityController.getDevices,
);

securityRouter.delete(
  '/devices',
  refreshTokenMiddleware,
  securityController.deleteAllOtherDevices,
);

securityRouter.delete(
  '/devices/:deviceId',
  refreshTokenMiddleware,
  securityController.deleteDevice,
);