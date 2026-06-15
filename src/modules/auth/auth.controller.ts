import { Request, Response } from 'express';
import { authService } from './auth.service';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);

    if (!result) {
      res.sendStatus(401);
      return;
    }

    res.status(200).send(result);
  },

  async me(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
      res.sendStatus(401);
      return;
    }

    const result = await authService.getMe(userId);

    if (!result) {
      res.sendStatus(401);
      return;
    }

    res.status(200).send(result);
  },

  async registration(req: Request, res: Response): Promise<void> {
    const result = await authService.registration(req.body);

    if (!result.success) {
      res.status(400).send({
        errorsMessages: [
          {
            message: `User with this ${result.field} already exists`,
            field: result.field,
          },
        ],
      });
      return;
    }

    res.sendStatus(204);
  },

  async registrationConfirmation(req: Request, res: Response): Promise<void> {
    const result = await authService.confirmRegistration(req.body);

    if (!result) {
      res.status(400).send({
        errorsMessages: [
          {
            message: 'Confirmation code is incorrect, expired or already applied',
            field: 'code',
          },
        ],
      });
      return;
    }

    res.sendStatus(204);
  },

  async registrationEmailResending(req: Request, res: Response): Promise<void> {
    const result = await authService.resendRegistrationEmail(req.body);

    if (!result) {
      res.status(400).send({
        errorsMessages: [
          {
            message: 'Email is incorrect or already confirmed',
            field: 'email',
          },
        ],
      });
      return;
    }

    res.sendStatus(204);
  },
};