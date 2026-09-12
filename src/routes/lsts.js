// =============================================
// Cloudflare Worker - LSTS Routes (Branch Isolated)
// =============================================

import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  saveLstsRegistration,
  getLstsRegistration,
  getUserLstsRegistrations,
  getWeeklyLstsRegistrations,
  getAllLstsRegistrations,
  getWeekRange,
} from '../storage/kv';

const router = new Hono();

// =============================================
// POST /api/lsts - Submit LSTS registration
// =============================================
router.post('/', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');

    const {
      title = '',
      surname = '',
      otherNames = body.otherNames || body.other_names || '',
      phoneNumber = body.phoneNumber || body.phone_number || '',
      email = userEmail,
      residentialAddress = body.residentialAddress || body.residential_address || '',
      gender = '',
      baptized = body.baptized || body.is_baptized || false,
      departmentInChurch = body.departmentInChurch || body.department_in_church || [],
      positionInChurch = body.positionInChurch || body.position_in_church || '',
      Student = body.Student || body.is_student || false,
      departmentInSchool = body.departmentInSchool || body.department_in_school || '',
      level = '',
      visionGoals = body.visionGoals || body.vision_goals || '',
    } = body;

    // Validation
    if (!surname || !otherNames || !phoneNumber || !email || !residentialAddress || !gender) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const registration = {
      id: uuidv4(),
      user_id: userId,
      title,
      surname,
      other_names: otherNames,
      phone_number: phoneNumber,
      email,
      residential_address: residentialAddress,
      gender,
      is_baptized: baptized === 'Yes' || baptized === true,
      department_in_church: departmentInChurch,
      position_in_church: positionInChurch,
      is_student: Student === 'Yes' || Student === true,
      department_in_school: departmentInSchool,
      level,
      vision_goals: visionGoals,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // Save to branch-isolated KV namespace
    await saveLstsRegistration(c.env.LSTS_KV_BRANCH, registration);

    return c.json(
      {
        message: '✅ LSTS registration submitted successfully',
        registration,
      },
      201
    );
  } catch (err) {
    console.error('LSTS submit error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/lsts - Get all LSTS (admin only)
// =============================================
router.get('/', authMiddleware, adminMiddleware, async (c) => {
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
// GET /api/lsts/weekly - Get weekly LSTS (admin only)
// =============================================
router.get('/weekly', authMiddleware, adminMiddleware, async (c) => {
  try {
    const { monday, friday } = getWeekRange();
    const data = await getWeeklyLstsRegistrations(c.env.LSTS_KV_BRANCH);

    const weekFiltered = data.filter((reg) => {
      const d = new Date(reg.submitted_at);
      return d >= monday && d <= friday;
    });

    const weekNum = Math.ceil(monday.getDate() / 7);
    const monthName = monday.toLocaleString('default', { month: 'long' });
    const year = monday.getFullYear();

    return c.json({
      weekLabel: `LSTS registrations for the ${weekNum} week of ${monthName} ${year}`,
      registrations: weekFiltered,
      count: weekFiltered.length,
      weekRange: {
        start: monday.toISOString().split('T')[0],
        end: friday.toISOString().split('T')[0],
      },
    });
  } catch (err) {
    console.error('Weekly LSTS fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/lsts/user/week - Get user's current week LSTS
// =============================================
router.get('/user/week', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { monday, friday } = getWeekRange();
    const data = await getUserLstsRegistrations(c.env.LSTS_KV_BRANCH, userId);

    const weekFiltered = data.filter((reg) => {
      const d = new Date(reg.submitted_at);
      return d >= monday && d <= friday;
    });

    return c.json({
      registrations: weekFiltered,
      count: weekFiltered.length,
      week_range: {
        start: monday.toISOString(),
        end: friday.toISOString(),
      },
      has_registered_this_week: weekFiltered.length > 0,
    });
  } catch (err) {
    console.error('User week LSTS fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/lsts/user/all - Get user's all LSTS
// =============================================
router.get('/user/all', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const data = await getUserLstsRegistrations(c.env.LSTS_KV_BRANCH, userId);

    return c.json({
      registrations: data,
      count: data.length,
    });
  } catch (err) {
    console.error('User LSTS fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// GET /api/lsts/:id - Get specific LSTS
// =============================================
router.get('/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    const data = await getLstsRegistration(c.env.LSTS_KV_BRANCH, id);

    if (!data) {
      return c.json({ error: 'Registration not found' }, 404);
    }

    // Users can only see their own registrations unless admin
    if (
      data.user_id !== userId &&
      !(c.env.ADMIN_EMAILS || '').split(',').includes(userEmail)
    ) {
      return c.json({ error: 'Permission denied' }, 403);
    }

    return c.json({
      registration: data,
    });
  } catch (err) {
    console.error('LSTS fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

export default router;
