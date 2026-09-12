// =============================================
// Cloudflare Worker - Admin Routes (Branch Scoped)
// =============================================

import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  getAllLstsRegistrations,
  getAllPrayers,
  getAllSummitRegistrations,
} from '../storage/kv';

const router = new Hono();

// =============================================
// GET /api/admin/check - Check if user is admin
// =============================================
router.get('/check', authMiddleware, async (c) => {
  try {
    const adminEmails = (c.env.ADMIN_EMAILS || '').split(',').filter(Boolean);
    const userEmail = c.get('userEmail');
    const isAdmin = adminEmails.includes(userEmail);

    if (!isAdmin) {
      return c.json({
        isAdmin: false,
        message: 'User is not an admin for this branch',
      });
    }

    return c.json({
      isAdmin: true,
      email: userEmail,
      message: 'User is an admin for this branch',
    });
  } catch (err) {
    console.error('Admin check error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/admin/dashboard - Dashboard stats
// =============================================
router.get('/dashboard', authMiddleware, adminMiddleware, async (c) => {
  try {
    const lstsData = await getAllLstsRegistrations(c.env.LSTS_KV_BRANCH);
    const prayersData = await getAllPrayers(c.env.PRAYERS_KV_BRANCH);
    const summitData = await getAllSummitRegistrations(c.env.SUMMIT_KV_BRANCH);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lstsToday = lstsData.filter((reg) => new Date(reg.submitted_at) >= today).length;
    const prayersToday = prayersData.filter((reg) => new Date(reg.submitted_at) >= today).length;
    const summitToday = summitData.filter((reg) => new Date(reg.submitted_at) >= today).length;

    return c.json({
      dashboard: {
        totalLsts: lstsData.length,
        totalPrayers: prayersData.length,
        totalSummit: summitData.length,
        today: {
          lsts: lstsToday,
          prayers: prayersToday,
          summit: summitToday,
        },
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/admin/lsts/all - All LSTS
// =============================================
router.get('/lsts/all', authMiddleware, adminMiddleware, async (c) => {
  try {
    const data = await getAllLstsRegistrations(c.env.LSTS_KV_BRANCH);

    return c.json({
      registrations: data,
      count: data.length,
    });
  } catch (err) {
    console.error('LSTS fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/admin/prayers/all - All prayers
// =============================================
router.get('/prayers/all', authMiddleware, adminMiddleware, async (c) => {
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
// GET /api/admin/summit/all - All summit
// =============================================
router.get('/summit/all', authMiddleware, adminMiddleware, async (c) => {
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

export default router;
