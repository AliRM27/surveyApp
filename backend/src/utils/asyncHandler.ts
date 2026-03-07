import { Request, Response, NextFunction, RequestHandler } from 'express';

// Helper to catch async errors and pass them to Express error middleware.
export const asyncHandler =
  (handler: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
