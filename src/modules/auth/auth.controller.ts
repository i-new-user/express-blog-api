import { Request, Response } from 'express';
import { LoginInputDto } from './dto/login.input-dto';
import { authService } from './auth.service';

export const authController = { async login( req: Request<object, object, LoginInputDto>, res: Response ): Promise<void> {
    const result = await authService.login(req.body);

    if (!result) {
      res.sendStatus(401);
      return;
    }

    res.status(200).json(result);
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.sendStatus(401);
      return;
    }

    const result = await authService.getMe(req.userId);

    if (!result) {
      res.sendStatus(401);
      return;
    }

    res.status(200).json(result);
  },
};