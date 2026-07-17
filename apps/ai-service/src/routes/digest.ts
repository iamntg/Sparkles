import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { requireUserId, perUserRateLimiter } from '../middleware/userRateLimit';

const router = Router();

const digestRateLimiter = perUserRateLimiter({
  max: parseInt(process.env.RATE_LIMIT_PER_DAY || '10', 10),
  message: { error: 'Too many daily digest requests. Please try again tomorrow.' },
});

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
