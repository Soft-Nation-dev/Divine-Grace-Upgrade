// =============================================
// Cloudflare Worker - Auth Middleware
// =============================================

export const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return c.json({ error: 'Authentication is not configured' }, 500);
    }

    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const user = await res.json();
    c.set('userId', user.id);
    c.set('userEmail', user.email);
    c.set('user', user);

    await next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
};

export const adminMiddleware = async (c, next) => {
  const adminEmails = (c.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const userEmail = (c.get('userEmail') || '').trim().toLowerCase();

  if (!adminEmails.includes(userEmail)) {
    return c.json({ error: 'Forbidden - Admin access required' }, 403);
  }

  await next();
};
