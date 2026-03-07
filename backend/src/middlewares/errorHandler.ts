import { Request, Response, NextFunction } from 'express';

// Generic Express error handler to avoid repeating try/catch in controllers.
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);
  const message =
    err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  res.status(500).json({ message });
};
