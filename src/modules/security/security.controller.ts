import { Request, Response } from 'express';
import { securityQueryRepository } from './security.query-repository';
import { securityService } from './security.service';

export const securityController = {
  async getDevices(req: Request, res: Response) {
    if (!req.userId) {
      res.sendStatus(401);
      return;
    }

    const devices = await securityQueryRepository.getDevicesByUserId(
      req.userId,
    );

    res.status(200).send(devices);
  },

  async deleteAllOtherDevices(req: Request, res: Response) {
    if (!req.userId || !req.deviceId) {
      res.sendStatus(401);
      return;
    }

    await securityService.deleteAllOtherDevices(
      req.userId,
      req.deviceId,
    );

    res.sendStatus(204);
  },

  async deleteDevice(req: Request, res: Response) {
  if (!req.userId) {
    res.sendStatus(401);
    return;
  }

  const deviceId = req.params.deviceId;

  if (typeof deviceId !== 'string') {
    res.sendStatus(404);
    return;
  }

  const result = await securityService.deleteDevice(
    req.userId,
    deviceId,
  );

  if (result === 'notFound') {
    res.sendStatus(404);
    return;
  }

  if (result === 'forbidden') {
    res.sendStatus(403);
    return;
  }

  res.sendStatus(204);
},
};