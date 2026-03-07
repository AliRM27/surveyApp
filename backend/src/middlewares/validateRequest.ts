import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type Location = 'body' | 'params' | 'query';

export const validateRequest =
  (schema: ZodSchema, location: Location = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse((req as any)[location]);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.format()
      });
    }

    (req as any)[location] = result.data;
    return next();
  };
