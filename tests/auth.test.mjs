import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import authRoutes from '../src/routes/auth.js';

const originalFetch = globalThis.fetch;

const env = {
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'anon-test-key',
  SUPABASE_SERVICE_KEY: 'service-test-key',
  FRONTEND_URL: 'https://www.divinegraceunec.com.ng',
};

const post = (path, body, headers = {}) =>
  authRoutes.request(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    },
    env
  );

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('signup creates both the auth user and profile', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).endsWith('/auth/v1/admin/users')) {
      return Response.json({ id: 'user-1', email: 'member@example.com' }, { status: 200 });
    }
    return Response.json(
      [{ user_id: 'user-1', username: 'member', first_name: 'Grace' }],
      { status: 201 }
    );
  };

  const response = await post('/signup', {
    email: ' MEMBER@example.com ',
    password: 'secret1',
    username: 'member',
    firstName: 'Grace',
  });
  const data = await response.json();

  assert.equal(response.status, 201);
  assert.equal(data.user.id, 'user-1');
  assert.equal(calls.length, 2);
  assert.equal(JSON.parse(calls[0].init.body).email, 'member@example.com');
  assert.match(calls[1].url, /\/rest\/v1\/profiles$/);
});

test('login returns the Supabase session tokens', async () => {
  globalThis.fetch = async () =>
    Response.json({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: { id: 'user-1', email: 'member@example.com' },
    });

  const response = await post('/login', {
    email: 'MEMBER@example.com',
    password: 'secret1',
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.token, 'access-token');
  assert.equal(data.refreshToken, 'refresh-token');
});

test('login returns a safe error for invalid credentials', async () => {
  globalThis.fetch = async () => Response.json({ message: 'Invalid login credentials' }, { status: 400 });

  const response = await post('/login', {
    email: 'member@example.com',
    password: 'wrong-password',
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Invalid email or password' });
});

test('forgot password sends a recovery request with the configured redirect', async () => {
  let recoveryCall;
  globalThis.fetch = async (url, init) => {
    recoveryCall = { url: String(url), init };
    return Response.json({}, { status: 200 });
  };

  const response = await post('/forgot-password', { email: ' MEMBER@example.com ' });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.match(data.message, /If an account exists/);
  assert.match(recoveryCall.url, /\/auth\/v1\/recover\?redirect_to=/);
  assert.equal(JSON.parse(recoveryCall.init.body).email, 'member@example.com');
  assert.match(decodeURIComponent(recoveryCall.url), /forgot%20Password\/\?mode=reset/);
});

test('reset password updates the authenticated recovery user', async () => {
  let updateCall;
  globalThis.fetch = async (url, init) => {
    updateCall = { url: String(url), init };
    return Response.json({ id: 'user-1' }, { status: 200 });
  };

  const response = await post(
    '/reset-password',
    { newPassword: 'new-secret' },
    { Authorization: 'Bearer recovery-token' }
  );

  assert.equal(response.status, 200);
  assert.match(updateCall.url, /\/auth\/v1\/user$/);
  assert.equal(updateCall.init.headers.Authorization, 'Bearer recovery-token');
  assert.equal(JSON.parse(updateCall.init.body).password, 'new-secret');
});

test('reset password rejects requests without a recovery session', async () => {
  const response = await post('/reset-password', { newPassword: 'new-secret' });
  assert.equal(response.status, 401);
});
