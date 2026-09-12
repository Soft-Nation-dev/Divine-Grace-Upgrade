const API_BASE = `${window._backendUrl || 'https://divine-grace-upgrade-api-production.ojam.workers.dev'}/api/auth`;
let recoveryAccessToken = '';

document.addEventListener('DOMContentLoaded', () => {
  const sendResetCodeBtn = document.getElementById('sendResetCode');
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const queryParams = new URLSearchParams(window.location.search);
  recoveryAccessToken = hashParams.get('access_token') || '';

  const recoveryError = hashParams.get('error_description') || queryParams.get('error_description');
  if (recoveryError) {
    setMessage(decodeURIComponent(recoveryError.replace(/\+/g, ' ')), true);
    return;
  }

  if (hashParams.get('type') === 'recovery' && recoveryAccessToken) {
    showPasswordFields();
    return;
  }

  sendResetCodeBtn?.addEventListener('click', sendResetEmail);
});

function setMessage(message, isError = false) {
  const messageElement = document.getElementById('form-message');
  if (!messageElement) return;
  messageElement.textContent = message;
  messageElement.classList.toggle('error', isError);
  messageElement.classList.toggle('success', Boolean(message) && !isError);
}

async function parseResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { error: text || 'Unexpected server response' };
  }
}

async function sendResetEmail() {
  const email = document.getElementById('email').value.trim();
  const btn = document.getElementById('sendResetCode');
  if (!email) {
    setMessage('Please enter your email address.', true);
    return;
  }

  setMessage('');
  btn.innerText = 'Sending...';
  btn.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to send reset email.');
    setMessage(data.message || 'If an account exists for that email, a reset link has been sent.');
  } catch (err) {
    setMessage(err.message || 'Something went wrong. Please try again.', true);
  } finally {
    btn.innerText = 'Send Reset Link';
    btn.disabled = false;
  }
}

function showPasswordFields() {
  const container = document.getElementById('form-container');
  container.innerHTML = `
    <h2>Reset Your Password</h2>
    <p class="form-intro">Choose a new password with at least 6 characters.</p>
    <input type="password" id="newPassword" placeholder="New password" required>
    <input type="password" id="confirmPassword" placeholder="Confirm password" required>
    <p id="form-message" class="form-message" role="status" aria-live="polite"></p>
    <button type="button" id="resetPasswordBtn">Reset Password</button>
    <a class="back-to-login" href="../registerlogin/">Back to login</a>
  `;

  document.getElementById('resetPasswordBtn').addEventListener('click', resetPassword);
}

async function resetPassword() {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const btn = document.getElementById('resetPasswordBtn');

  if (!newPassword || !confirmPassword) {
    setMessage('Please fill in both password fields.', true);
    return;
  }

  if (newPassword !== confirmPassword) {
    setMessage('Passwords do not match.', true);
    return;
  }

  if (newPassword.length < 6) {
    setMessage('Password must be at least 6 characters long.', true);
    return;
  }

  setMessage('');
  btn.innerText = 'Resetting...';
  btn.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recoveryAccessToken}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Password reset failed.');

    window.history.replaceState(null, '', window.location.pathname);
    setMessage('Password updated. Redirecting you to login...');
    window.setTimeout(() => {
      window.location.href = '../registerlogin/';
    }, 1400);
  } catch (err) {
    setMessage(err.message || 'Password reset failed.', true);
  } finally {
    btn.innerText = 'Reset Password';
    btn.disabled = false;
  }
}
