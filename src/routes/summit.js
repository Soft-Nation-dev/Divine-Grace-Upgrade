// =============================================
// Cloudflare Worker - Summit Routes (Branch Isolated)
// =============================================

import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  saveSummitRegistration,
  getSummitRegistration,
  getUserSummitRegistrations,
  getAllSummitRegistrations,
} from '../storage/kv';

const router = new Hono();

// =============================================
// POST /api/summit - Submit summit registration
// =============================================
router.post('/', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const userId = c.get('userId');
    const { fullName, email, phoneNumber, accomodation, dietary_preference, level } = body;

    if (!fullName || !email || !phoneNumber) {
      return c.json({ error: 'Full name, email, and phone number are required' }, 400);
    }

    const registration = {
      id: uuidv4(),
      user_id: userId,
      full_name: fullName,
      email,
      phone_number: phoneNumber,
      accomodation: accomodation || '',
      dietary_preference: dietary_preference || '',
      level: level || '',
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    await saveSummitRegistration(c.env.SUMMIT_KV_BRANCH, registration);

    return c.json(
      {
        message: '✅ Summit registration submitted successfully',
        registration,
      },
      201
    );
  } catch (err) {
    console.error('Summit submit error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/summit - Get all summit (admin only)
// =============================================
router.get('/', authMiddleware, adminMiddleware, async (c) => {
  try {
    const data = await getAllSummitRegistrations(c.env.SUMMIT_KV_BRANCH);

    return c.json({
      registrations: data,
      count: data.length,
    });
  } catch (err) {
    console.error('Summit fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/summit/user/all - Get user's summit
// =============================================
router.get('/user/all', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const data = await getUserSummitRegistrations(c.env.SUMMIT_KV_BRANCH, userId);

    return c.json({
      registrations: data,
      count: data.length,
    });
  } catch (err) {
    console.error('User summit fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/summit/:id - Get specific summit
// =============================================
router.get('/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const data = await getSummitRegistration(c.env.SUMMIT_KV_BRANCH, id);

    if (!data) {
      return c.json({ error: 'Registration not found' }, 404);
    }

    return c.json({
      registration: data,
    });
  } catch (err) {
    console.error('Summit fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

export default router;
