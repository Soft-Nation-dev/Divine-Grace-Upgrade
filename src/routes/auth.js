// =============================================
// Cloudflare Worker - Authentication Routes
// =============================================

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';

const router = new Hono();

const parseJsonSafe = async (res) => {
  const text = await res.text();
  try {
    return { text, data: text ? JSON.parse(text) : null };
  } catch {
    return { text, data: null };
  }
};

const getErrorMessage = (responseText, responseData, fallback) => {
  const rawMessage =
    responseData?.message ||
    responseData?.msg ||
    responseData?.error_description ||
    responseData?.error ||
    responseText ||
    fallback;

  return typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);
};

const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

// =============================================
// POST /api/auth/signup
// =============================================
router.post('/signup', async (c) => {
  try {
    let payload;
    try {
      payload = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid request payload' }, 400);
    }

    const {
      email: rawEmail,
      password,
      username,
      firstName,
      first_name,
      otherNames,
      other_names,
      phoneNumber,
      phone_number,
      residentialAddress,
      residential_address,
      departmentInChurch,
      department_in_church,
      departmentInSchool,
      department_in_school,
      fullName,
      full_name,
      displayName,
      display_name,
      title,
    } = payload;

    const email = normalizeEmail(rawEmail);

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400);
    }

    const supabaseUrl = c.env.SUPABASE_URL;
    const serviceKey = c.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey || !c.env.SUPABASE_ANON_KEY) {
      return c.json({ error: 'Supabase environment is not configured' }, 500);
    }

    const normalizedFirstName = firstName || first_name || '';
    const normalizedOtherNames = otherNames || other_names || '';
    const normalizedPhoneNumber = phoneNumber || phone_number || null;
    const normalizedResidentialAddress =
      residentialAddress || residential_address || null;
    const normalizedDepartmentInChurch =
      departmentInChurch || department_in_church || null;
    const normalizedDepartmentInSchool =
      departmentInSchool || department_in_school || null;
    const normalizedUsername = username || null;

    // Create auth user via Supabase
    const signupRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: c.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || full_name || displayName || display_name || title || '',
          first_name: normalizedFirstName,
          other_names: normalizedOtherNames,
          username: normalizedUsername,
        },
      }),
    });

    const { text: signupText, data: signupData } = await parseJsonSafe(signupRes);

    if (!signupRes.ok) {
      const errorMessage = getErrorMessage(signupText, signupData, 'Signup failed');

      const alreadyExists = /already|exists|registered/i.test(errorMessage);
      const statusCode = alreadyExists ? 409 : 400;

      return c.json({ error: errorMessage }, statusCode);
    }

    const userData = signupData || {};
    const createdUserId = userData.user?.id || userData.id;
    const createdUserEmail = userData.user?.email || userData.email || email;

    if (!createdUserId) {
      return c.json({ error: 'User created but missing user id' }, 500);
    }

    const profileInsertRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: c.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: createdUserId,
        username: normalizedUsername,
        first_name: normalizedFirstName,
        other_names: normalizedOtherNames,
        phone_number: normalizedPhoneNumber,
        residential_address: normalizedResidentialAddress,
        department_in_church: normalizedDepartmentInChurch,
        department_in_school: normalizedDepartmentInSchool,
      }),
    });

    const { text: profileText, data: profileData } = await parseJsonSafe(profileInsertRes);

    if (!profileInsertRes.ok) {
      // Best effort rollback so auth and profile do not diverge.
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${createdUserId}`, {
        method: 'DELETE',
        headers: {
          apikey: c.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${serviceKey}`,
        },
      });

      const profileError = getErrorMessage(
        profileText,
        profileData,
        'Profile creation failed'
      );

      return c.json({ error: profileError }, 400);
    }

    const insertedProfile = Array.isArray(profileData) ? profileData[0] : profileData;

    return c.json(
      {
        message: '✅ Account created successfully',
        user: {
          id: createdUserId,
          email: createdUserEmail,
          username: insertedProfile?.username || null,
          firstName: insertedProfile?.first_name || '',
          otherNames: insertedProfile?.other_names || '',
          phoneNumber: insertedProfile?.phone_number || null,
          residentialAddress: insertedProfile?.residential_address || null,
          departmentInChurch: insertedProfile?.department_in_church || null,
          departmentInSchool: insertedProfile?.department_in_school || null,
        },
      },
      201
    );
  } catch (err) {
    console.error('Signup error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// POST /api/auth/login
// =============================================
router.post('/login', async (c) => {
  try {
    let payload;
    try {
      payload = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid request payload' }, 400);
    }

    const email = normalizeEmail(payload.email);
    const password = payload.password;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabaseUrl = c.env.SUPABASE_URL;
    const anonKey = c.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return c.json({ error: 'Supabase environment is not configured' }, 500);
    }

    // Authenticate with Supabase
    const loginRes = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!loginRes.ok) {
      const isRateLimited = loginRes.status === 429;
      return c.json(
        { error: isRateLimited ? 'Too many login attempts. Please try again later.' : 'Invalid email or password' },
        isRateLimited ? 429 : 401
      );
    }

    const data = await loginRes.json();

    return c.json({
      message: '✅ Logged in successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      token: data.access_token,
      refreshToken: data.refresh_token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// POST /api/auth/forgot-password
// =============================================
router.post('/forgot-password', async (c) => {
  try {
    let payload;
    try {
      payload = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid request payload' }, 400);
    }

    const email = normalizeEmail(payload.email);
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const supabaseUrl = c.env.SUPABASE_URL;
    const anonKey = c.env.SUPABASE_ANON_KEY;
    const frontendUrl = c.env.FRONTEND_URL;

    if (!supabaseUrl || !anonKey || !frontendUrl) {
      return c.json({ error: 'Password recovery is not configured' }, 500);
    }

    const redirectUrl = new URL('/forgot%20Password/?mode=reset', frontendUrl).toString();
    const recoveryRes = await fetch(
      `${supabaseUrl}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectUrl)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!recoveryRes.ok) {
      const isRateLimited = recoveryRes.status === 429;
      return c.json(
        {
          error: isRateLimited
            ? 'Too many reset requests. Please try again later.'
            : 'Unable to send a password reset email right now.',
        },
        isRateLimited ? 429 : 502
      );
    }

    return c.json({
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return c.json({ error: 'Unable to send a password reset email right now.' }, 500);
  }
});

// =============================================
// POST /api/auth/reset-password
// =============================================
router.post('/reset-password', async (c) => {
  try {
    const authHeader = c.req.header('Authorization') || '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    let payload;
    try {
      payload = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid request payload' }, 400);
    }

    const newPassword = payload.newPassword;
    if (!accessToken) {
      return c.json({ error: 'A valid recovery session is required' }, 401);
    }
    if (!newPassword || newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400);
    }

    const supabaseUrl = c.env.SUPABASE_URL;
    const anonKey = c.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return c.json({ error: 'Password recovery is not configured' }, 500);
    }

    const updateRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ password: newPassword }),
    });

    if (!updateRes.ok) {
      return c.json(
        {
          error:
            updateRes.status === 401
              ? 'This password reset link is invalid or has expired.'
              : 'Password reset failed. Please request a new link.',
        },
        updateRes.status === 401 ? 401 : 400
      );
    }

    return c.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return c.json({ error: 'Password reset failed. Please request a new link.' }, 500);
  }
});

// =============================================
// GET /api/auth/profile
// =============================================
router.get('/profile', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    const supabaseUrl = c.env.SUPABASE_URL;
    const serviceKey = c.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey || !c.env.SUPABASE_ANON_KEY) {
      return c.json({ error: 'Supabase environment is not configured' }, 500);
    }

    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?user_id=eq.${encodeURIComponent(userId)}&select=*`,
      {
        method: 'GET',
        headers: {
          apikey: c.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );

    const { data: profileData } = await parseJsonSafe(profileRes);
    const profile = Array.isArray(profileData) ? profileData[0] : null;

    return c.json({
      user: {
        id: userId,
        email: userEmail,
        username: profile?.username || '',
        firstName: profile?.first_name || '',
        otherNames: profile?.other_names || '',
        phoneNumber: profile?.phone_number || '',
        residentialAddress: profile?.residential_address || '',
        departmentInChurch: profile?.department_in_church || '',
        departmentInSchool: profile?.department_in_school || '',
      },
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =============================================
// POST /api/auth/logout
// =============================================
router.post('/logout', authMiddleware, async (c) => {
  try {
    return c.json({
      message: '✅ Logged out successfully',
    });
  } catch (err) {
    console.error('Logout error:', err);
    return c.json({ error: err.message }, 500);
  }
});

export default router;
