import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { requireUserId, perUserRateLimiter } from '../middleware/userRateLimit';

const router = Router();

const clusterRateLimiter = perUserRateLimiter({
  max: parseInt(process.env.RATE_LIMIT_PER_DAY || '10', 10),
  message: { error: 'Too many clustering requests. Please try again tomorrow.' },
});

router.post('/', requireUserId, clusterRateLimiter, async (req: Request, res: Response) => {
  try {
    const { ideas } = req.body;

    if (!ideas || !Array.isArray(ideas) || ideas.length === 0) {
      return res.status(400).json({ error: 'A non-empty array of ideas is required.' });
    }

    const result = await aiService.clusterIdeas(ideas);
    res.json(result);
  } catch (error: any) {
    console.error('Clustering error:', error);
    res.status(500).json({ error: 'Failed to cluster ideas. Please try again later.' });
  }
});

export default router;
