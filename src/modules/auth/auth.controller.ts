import { Request, Response } from 'express';
import { authService } from './auth.service';

const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || 'unknown';
};

const getDeviceTitle = (req: Request): string => {
  return req.headers['user-agent'] || 'unknown';
};

const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
): void => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 20 * 1000,
  });
};

export const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(
      req.body,
      getClientIp(req),
      getDeviceTitle(req),
    );

    if (!result) {
      res.sendStatus(401);
      return;
    }

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).send({
      accessToken: result.accessToken,
    });
  },

  async refreshToken(req: Request, res: Response) {
    if (!req.userId || !req.deviceId || !req.tokenIssuedAt) {
      res.sendStatus(401);
      return;
    }

    const result = await authService.refreshToken(
      req.userId,
      req.deviceId,
      req.tokenIssuedAt,
    );

    if (!result) {
      res.sendStatus(401);
      return;
    }

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).send({
      accessToken: result.accessToken,
    });
  },

 async logout(req: Request, res: Response) {
  try {
    if (!req.userId || !req.deviceId || !req.tokenIssuedAt) {
      res.sendStatus(401);
      return;
    }

    const isLoggedOut = await authService.logout(
      req.userId,
      req.deviceId,
      req.tokenIssuedAt,
    );

    if (!isLoggedOut) {
      res.sendStatus(401);
      return;
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.sendStatus(204);
  } catch {
    res.sendStatus(401);
  }
},

  async me(req: Request, res: Response) {
    if (!req.userId) {
      res.sendStatus(401);
      return;
    }

    const result = await authService.getMe(req.userId);

    if (!result) {
      res.sendStatus(401);
      return;
    }

    res.status(200).send(result);
  },

  async registration(req: Request, res: Response) {
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

  async confirmRegistration(req: Request, res: Response) {
    const isConfirmed = await authService.confirmRegistration(req.body);

    if (!isConfirmed) {
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

  async resendRegistrationEmail(req: Request, res: Response) {
    const isResent = await authService.resendRegistrationEmail(req.body);

    if (!isResent) {
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

  async passwordRecovery(req: Request, res: Response) {
  await authService.passwordRecovery(req.body.email);
  res.sendStatus(204);
},

async newPassword(req: Request, res: Response) {
  const isSuccess = await authService.newPassword(
    req.body.newPassword,
    req.body.recoveryCode,
  );

  if (!isSuccess) {
    res.status(400).send({
      errorsMessages: [
        {
          message: 'Recovery code is incorrect or expired',
          field: 'recoveryCode',
        },
      ],
    });
    return;
  }

  res.sendStatus(204);
},
};