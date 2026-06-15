import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodIssue } from 'zod';

/**
 * validateBody — универсальный middleware для проверки req.body через Zod.
 *
 * Важно:
 * Zod v4 использует result.error.issues,
 * а не result.error.errors.
 */
export const validateBody =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        errorsMessages: result.error.issues.map((error: ZodIssue) => ({
          message: error.message,
          field: String(error.path[0]),
        })),
      });

      return;
    }

    req.body = result.data;
    next();
  };