const fetch = global.fetch || require('node-fetch');

const BASE = process.env.BASE_URL || 'http://localhost:4050/api/v1';
const email = 'user@aiiforsa.com';
const password = 'user123456';

async function run() {
  try {
    console.log('Logging in as', email, '->', `${BASE}/auth/login`);
    const loginResp = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginData = await loginResp.json().catch(() => ({}));
    console.log('Login status:', loginResp.status);
    console.log('Login response:', JSON.stringify(loginData, null, 2));

    // Support API wrapper format: { statusCode, message, data: { accessToken, refreshToken, user }}
    const token =
      loginData?.accessToken || loginData?.data?.accessToken || null;

    if (!loginResp.ok || !token) {
      console.error('Login failed — no access token returned');
      return;
    }
    console.log('Got access token, calling XP endpoint...');

    const xpResp = await fetch(`${BASE}/users/me/xp`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const xpData = await xpResp.json().catch(() => ({}));
    console.log('XP status code:', xpResp.status);
    console.log('XP response:', JSON.stringify(xpData, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

run();