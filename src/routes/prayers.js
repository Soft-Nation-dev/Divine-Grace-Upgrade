// =============================================
// Cloudflare Worker - Prayer Routes (Branch Isolated)
// =============================================

import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { savePrayerRequest, getPrayerRequest, getAllPrayers } from '../storage/kv';

const router = new Hono();

// =============================================
// POST /api/prayers - Submit prayer request
// =============================================
router.post('/', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    const { title, description, category = 'General', urgency = 'Normal' } = body;

    if (!title || !description) {
      return c.json({ error: 'Title and description are required' }, 400);
    }

    const prayer = {
      id: uuidv4(),
      user_id: userId,
      user_email: userEmail,
      title,
      description,
      category,
      urgency,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    await savePrayerRequest(c.env.PRAYERS_KV_BRANCH, prayer);

    return c.json(
      {
        message: '✅ Prayer request submitted successfully',
        prayer,
      },
      201
    );
  } catch (err) {
    console.error('Prayer submit error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/prayers - Get all prayers (admin only)
// =============================================
router.get('/', authMiddleware, adminMiddleware, async (c) => {
  try {
    const data = await getAllPrayers(c.env.PRAYERS_KV_BRANCH);

    return c.json({
      prayers: data,
      count: data.length,
    });
  } catch (err) {
    console.error('Prayers fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/prayers/:id - Get specific prayer
// =============================================
router.get('/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const data = await getPrayerRequest(c.env.PRAYERS_KV_BRANCH, id);

    if (!data) {
      return c.json({ error: 'Prayer request not found' }, 404);
    }

    return c.json({
      prayer: data,
    });
  } catch (err) {
    console.error('Prayer fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

export default router;
