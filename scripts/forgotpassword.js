import { authHeaders } from './utils.js';

const API_BASE = "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/Auth";

document.addEventListener('DOMContentLoaded', () => {
  const sendResetCodeBtn = document.getElementById('sendResetCode');
  sendResetCodeBtn.addEventListener('click', sendResetEmail);
});

function sendResetEmail() {
  const email = document.getElementById('email').value;
  const btn = document.getElementById('sendResetCode');
  if (!email) return alert("Please enter your email");

  btn.innerText = "Sending...";
  btn.disabled = true;

  fetch(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to send reset email.");
      return res.json();
    })
    .then(() => {
      showTokenField(email);
    })
    .catch(err => {
      alert(err.message || "Something went wrong.");
    })
    .finally(() => {
      btn.innerText = "Send Reset Code";
      btn.disabled = false;
    });
}

function showTokenField(email) {
  const container = document.getElementById('form-container');
  container.innerHTML = `
    <h2>Enter Reset Token</h2>
    <input type="text" id="token" placeholder="Enter the token sent to your email" required>
    <button id="verifyToken">Verify Token</button>
  `;

  document.getElementById('verifyToken').addEventListener('click', () => {
    const token = document.getElementById('token').value.trim();
    if (!token) return alert("Please enter the token");

    showPasswordFields(email, token);
  });
}

function showPasswordFields(email, token) {
  const container = document.getElementById('form-container');
  container.innerHTML = `
    <h2>Reset Your Password</h2>
    <input type="password" id="newPassword" placeholder="New password" required>
    <input type="password" id="confirmPassword" placeholder="Confirm password" required>
    <button id="resetPasswordBtn">Reset Password</button>
  `;

  document.getElementById('resetPasswordBtn').addEventListener('click', () => {
    resetPassword(email, token);
  });
}

function resetPassword(email, token) {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const btn = document.getElementById('resetPasswordBtn');

  if (!newPassword || !confirmPassword) {
    return alert("Please fill all fields");
  }

  if (newPassword !== confirmPassword) {
    return alert("Passwords do not match");
  }

  btn.innerText = "Resetting...";
  btn.disabled = true;

  fetch(`${API_BASE}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(), // Use auth headers from utils
    },
    body: JSON.stringify({ email, token, newPassword })
  })
    .then(res => {
      if (!res.ok) throw new Error("Password reset failed");
      return res.json();
    })
    .then(() => {
      alert("Password reset successfully. Redirecting to login...");
      window.location.href = "../registerlogin";
    })
    .catch(err => {
      alert(err.message || "Reset failed.");
    })
    .finally(() => {
      btn.innerText = "Reset Password";
      btn.disabled = false;
    });
}
