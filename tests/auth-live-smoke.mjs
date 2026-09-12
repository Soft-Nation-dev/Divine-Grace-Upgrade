import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { createClient } from '@supabase/supabase-js';

const parseEnvFile = (contents) =>
  Object.fromEntries(
    contents
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2].replace(/^("|')|("|')$/g, '')])
  );

const localEnv = parseEnvFile(await readFile(new URL('../.env.local', import.meta.url), 'utf8'));
const supabaseUrl = localEnv.SUPABASE_URL;
const anonKey = localEnv.SUPABASE_ANON_KEY;
const serviceKey = localEnv.SUPABASE_SERVICE_KEY;
const apiBase = process.env.AUTH_API_BASE || 'http://127.0.0.1:8787/api/auth';

assert.ok(supabaseUrl && anonKey && serviceKey, 'Missing Supabase values in .env.local');

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});
const authClient = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
const email = `auth-smoke-${suffix}@example.invalid`;
const username = `smoke${suffix}`;
const originalPassword = 'SmokePass!2026';
const updatedPassword = 'UpdatedSmoke!2026';
let userId = '';

const apiPost = async (path, body, token = '') => {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://127.0.0.1:4173',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return { response, data };
};

try {
  const signup = await apiPost('/signup', {
    email,
    password: originalPassword,
    username,
    firstName: 'Auth',
    otherNames: 'Smoke Test',
    phoneNumber: '08000000000',
    residentialAddress: 'Automated test',
    departmentInChurch: 'Testing',
    departmentInSchool: 'Testing',
    fullName: 'Auth Smoke Test',
  });
  assert.equal(signup.response.status, 201, JSON.stringify(signup.data));
  userId = signup.data.user.id;

  const firstLogin = await apiPost('/login', { email, password: originalPassword });
  assert.equal(firstLogin.response.status, 200, JSON.stringify(firstLogin.data));
  assert.ok(firstLogin.data.token, 'Login did not return an access token');

  const { data: recovery, error: recoveryError } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
  });
  assert.ifError(recoveryError);
  assert.ok(recovery.properties.hashed_token, 'Recovery link did not include a hashed token');

  const { data: verified, error: verificationError } = await authClient.auth.verifyOtp({
    type: 'recovery',
    token_hash: recovery.properties.hashed_token,
  });
  assert.ifError(verificationError);
  assert.ok(verified.session?.access_token, 'Recovery token did not create a session');

  const reset = await apiPost(
    '/reset-password',
    { newPassword: updatedPassword },
    verified.session.access_token
  );
  assert.equal(reset.response.status, 200, JSON.stringify(reset.data));

  const secondLogin = await apiPost('/login', { email, password: updatedPassword });
  assert.equal(secondLogin.response.status, 200, JSON.stringify(secondLogin.data));
  assert.ok(secondLogin.data.token, 'Updated password did not authenticate');

  console.log(JSON.stringify({ signup: true, login: true, recovery: true, reset: true }));
} finally {
  if (userId) {
    await admin.from('profiles').delete().eq('user_id', userId);
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    assert.ifError(deleteError);
  }
}
