// =============================================
// Cloudflare Worker - Divine Grace UNN (Branch)
// Main entry point using Hono framework
// =============================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth';
import lstsRoutes from './routes/lsts';
import prayerRoutes from './routes/prayers';
import summitRoutes from './routes/summit';
import messageRoutes from './routes/messages';
import adminRoutes from './routes/admin';

const app = new Hono();

// =============================================
// CORS Configuration
// =============================================
app.use('*', cors({
  origin: [
    'https://yourdomain.com',
    'https://divine-grace-upgrade.pages.dev',
    'https://divinegraceunec.com.ng',
    'https://www.divinegraceunec.com.ng',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:8787'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
}));

// =============================================
// Health Check
// =============================================
app.get('/health', (c) => {
  return c.json({
    status: '✅ Divine Grace UNN (Branch) API is running',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'production',
    version: '1.0.0',
  });
});

app.get('/', (c) => {
  return c.json({
    message: '🙏 Divine Grace UNN (Branch) - Cloudflare Workers API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      lsts: '/api/lsts',
      prayers: '/api/prayers',
      summit: '/api/summit',
      messages: '/api/messages',
      admin: '/api/admin',
      health: '/health',
    },
  });
});

// =============================================
// API Routes
// =============================================

// Auth routes (no authentication required for signup/login)
app.route('/api/auth', authRoutes);

// Protected routes (require authentication)
app.route('/api/lsts', lstsRoutes);
app.route('/api/prayers', prayerRoutes);
app.route('/api/summit', summitRoutes);
app.route('/api/messages', messageRoutes);
app.route('/api/admin', adminRoutes);

// =============================================
// Error Handling
// =============================================
app.onError((err, c) => {
  console.error('API Error:', err);

  if (err.message.includes('Unauthorized')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (err.message.includes('Forbidden')) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  if (err.message.includes('Not found')) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json(
    {
      error: err.message || 'Internal server error',
      status: 500,
    },
    500
  );
});

// 404 Handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found', path: c.req.path }, 404);
});

export default app;
