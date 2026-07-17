import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { requireUserId, perUserRateLimiter } from '../middleware/userRateLimit';

const router = Router();

const reviewRateLimiter = perUserRateLimiter({
  max: parseInt(process.env.REVIEW_RATE_LIMIT_PER_DAY || '30', 10),
  message: { error: 'Too many review requests. Please try again tomorrow.' },
});

router.post('/', requireUserId, reviewRateLimiter, async (req: Request, res: Response) => {
  try {
    const { text, description, includePlan } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'A non-empty idea text is required.' });
    }

    const result = await aiService.reviewIdea(
      { text, description: typeof description === 'string' ? description : undefined },
      includePlan === true
    );
    res.json(result);
  } catch (error: any) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Failed to review the spark. Please try again later.' });
  }
});

export default router;
