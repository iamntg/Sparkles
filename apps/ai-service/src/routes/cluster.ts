import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
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
