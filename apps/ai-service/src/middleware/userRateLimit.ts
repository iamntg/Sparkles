import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Rejects requests that don't identify a user, so rate limits can't be sidestepped. */
export const requireUserId = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];
  if (!userId || typeof userId !== 'string') {
    return res.status(401).json({ error: 'Unauthorized: User ID is required to use the AI service.' });
  }
  next();
};

/**
 * A per-user, per-day cap. Pair with `requireUserId` — on its own it buckets
 * every unidentified caller together under 'anonymous'.
 */
export function perUserRateLimiter(opts: { max: number; message: { error: string } }) {
  return rateLimit({
    windowMs: DAY_MS,
    max: opts.max,
    message: opts.message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const userId = req.headers['x-user-id'];
      return typeof userId === 'string' && userId ? userId : 'anonymous';
    },
  });
}
