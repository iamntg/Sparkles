import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { aiService } from '../services/aiService';

const router = Router();

// Rate limiter configuration: 10 requests per 24 hours per user
const digestRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: parseInt(process.env.RATE_LIMIT_PER_DAY || '10', 10), // Limit each user to 10 requests per 24 hours
  message: { error: 'Too many daily digest requests. Please try again tomorrow.' },
  standardHeaders: true, // Return rate limit info in the headers
  legacyHeaders: false, // Disable legacy headers
  keyGenerator: (req: Request) => {
    const userId = req.headers['x-user-id'];
    if (!userId || typeof userId !== 'string') {
      return 'anonymous';
    }
    return userId;
  },
});

// Middleware to ensure user ID is present
const requireUserId = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];
  if (!userId || typeof userId !== 'string') {
    return res.status(401).json({ error: 'Unauthorized: User ID is required to use the AI service.' });
  }
  next();
};

router.post('/', requireUserId, digestRateLimiter, async (req: Request, res: Response) => {
  try {
    const { ideas } = req.body;

    if (!ideas || !Array.isArray(ideas) || ideas.length === 0) {
      return res.status(400).json({ error: 'A non-empty array of ideas is required.' });
    }

    const result = await aiService.generateDailyDigest(ideas);
    res.json(result);
  } catch (error: any) {
    console.error('Digest generation error:', error);
    res.status(500).json({ error: 'Failed to generate daily digest. Please try again later.' });
  }
});

export default router;
