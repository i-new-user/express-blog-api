import { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler = <
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown,
>(
  controller: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => Promise<void>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next): void => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
};