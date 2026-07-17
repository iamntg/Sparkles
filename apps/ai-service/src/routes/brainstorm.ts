import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { requireUserId, perUserRateLimiter } from '../middleware/userRateLimit';

const router = Router();

// Chat is turn-by-turn, so this ceiling is far higher than the batch endpoints'.
const brainstormRateLimiter = perUserRateLimiter({
  max: parseInt(process.env.BRAINSTORM_RATE_LIMIT_PER_DAY || '100', 10),
  message: { error: 'Too many brainstorm messages. Please try again tomorrow.' },
});

type IncomingMessage = { role?: unknown; text?: unknown };

router.post('/', requireUserId, brainstormRateLimiter, async (req: Request, res: Response) => {
  try {
    const { text, description, history } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'A non-empty idea text is required.' });
    }
    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'A non-empty message history is required.' });
    }

    const cleaned = (history as IncomingMessage[])
      .filter(m => typeof m?.text === 'string' && (m.role === 'user' || m.role === 'assistant'))
      .map(m => ({ role: m.role as 'user' | 'assistant', text: m.text as string }));

    if (cleaned.length === 0) {
      return res.status(400).json({ error: 'No valid messages in history.' });
    }

    const reply = await aiService.brainstorm(
      { text, description: typeof description === 'string' ? description : undefined },
      cleaned
    );
    res.json({ reply });
  } catch (error: any) {
    console.error('Brainstorm error:', error);
    res.status(500).json({ error: 'Failed to reach the brainstorm partner. Please try again later.' });
  }
});

export default router;
