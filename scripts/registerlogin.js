import { setButtonLoading, toggleVisibility } from './utils.js';

function reset() {
  document.querySelectorAll('.creatacc-div input').forEach(i => i.value = '');
  hideMessage('register-message');
  hideMessage('login-message');
}

const signIn   = document.querySelector('.js-signinbut');
const signUp   = document.querySelector('.js-signupbut');
const createAccountSection = document.querySelector('.creatacc-div');
const welcomeBackSection   = document.querySelector('.signin-div');
const helloDiv             = document.querySelector('.hello-div');
const welcomeDiv           = document.querySelector('.welcomeback-div');
const loginButton          = document.querySelector('.js-login-button');
const createAccountButton  = document.querySelector('.js-create-account-button');

createAccountSection.classList.add('visible');
helloDiv.classList.add('visible');
welcomeDiv.classList.add('hidden');
welcomeBackSection.classList.add('hidden');

signIn.addEventListener('click', () => {
  toggleVisibility([createAccountSection, helloDiv], [welcomeBackSection, welcomeDiv]);
  hideMessage('register-message');
  hideMessage('login-message');
});
signUp.addEventListener('click', () => {
  toggleVisibility([welcomeBackSection, welcomeDiv], [createAccountSection, helloDiv]);
  hideMessage('register-message');
  hideMessage('login-message');
});

function $(id) {
  const el = document.getElementById(id);
  if (!el) console.error(`❌ Missing element with id="${id}"`);
  return el;
}

function showMessage(id, message) {
  const el = $(id);
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  }
}

function hideMessage(id) {
  const el = $(id);
  if (el) {
    el.textContent = '';
    el.style.display = 'none';
  }
}

function clearMessageOnInput(inputEl, messageId) {
  if (inputEl) {
    inputEl.addEventListener('input', () => hideMessage(messageId));
  }
}


const firstnameInput       = $('register-firstname');
const nameInput            = $('register-name');
const userNameInput        = $('register-username');
const deptChurchInput      = $('department-in-church');
const deptSchoolInput      = $('department-in-school');
const addressInput         = $('residential-address');
const emailInput           = $('register-email');
const phoneInput           = $('register-phone');
const passwordInput        = $('register-password');
const confirmPasswordInput = $('register-confirm-password');
const loginEmailInput      = $('login-email');
const loginPasswordInput   = $('login-password');

[
  firstnameInput,
  nameInput,
  userNameInput,
  deptChurchInput,
  deptSchoolInput,
  addressInput,
  emailInput,
  phoneInput,
  passwordInput,
  confirmPasswordInput
].forEach(input => clearMessageOnInput(input, 'register-message'));

[loginEmailInput, loginPasswordInput].forEach(input =>
  clearMessageOnInput(input, 'login-message')
);

createAccountButton.addEventListener('click', async () => {
  hideMessage('register-message');
  setButtonLoading(createAccountButton, true);

  const FirstName       = firstnameInput.value.trim();
  const Othernames      = nameInput.value.trim();
  const Username        = userNameInput.value.trim();
  const DepartmentInChurch = deptChurchInput.value.trim();
  const DepartmentInSchool= deptSchoolInput.value.trim();
  const ResidentialAddress= addressInput.value.trim();
  const Email           = emailInput.value.trim();
  const PhoneNumber     = phoneInput.value.trim();
  const Password        = passwordInput.value;
  const ConfirmPassword = confirmPasswordInput.value;

  if (![FirstName, Othernames, DepartmentInChurch, DepartmentInSchool, ResidentialAddress, Email, PhoneNumber, Password, ConfirmPassword].every(v => v)) {
    showMessage('register-message', 'Please fill in all fields.');
    setButtonLoading(createAccountButton, false);
    return;
  }
  if (Password !== ConfirmPassword) {
    showMessage('register-message', 'Passwords do not match.');
    setButtonLoading(createAccountButton, false);
    return;
  }
  if (Password.length < 6) {
    showMessage('register-message', 'Password must be at least 6 characters long.');
    setButtonLoading(createAccountButton, false);
    return;
  }
  if (!/^[a-zA-Z0-9]+$/.test(Username)) {
    showMessage('register-message', 'Username can only contain letters and numbers.');
    setButtonLoading(createAccountButton, false);
    return;
  }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(Email)) {
    showMessage('register-message', 'Please enter a valid email address.');
    setButtonLoading(createAccountButton, false);
    return;
  }
  if (!/^\d{11}$/.test(PhoneNumber)) {
    showMessage('register-message', 'Phone number must be exactly 11 digits long.');
    setButtonLoading(createAccountButton, false);
    return;
  }

  try {
    const res = await fetch(
      'https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/register',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FirstName,
          Othernames,
          Username,
          DepartmentInChurch,
          DepartmentInSchool,
          ResidentialAddress,
          Email,
          PhoneNumber,
          Password,
          ConfirmPassword
        })
      }
    );
    const data = await res.json();
    if (res.ok) {
      showMessage('register-message', data.message);
      toggleVisibility(
        [createAccountSection, helloDiv],
        [welcomeBackSection, welcomeDiv]
      );
      reset();
    } else {
      showMessage('register-message', data.message);
    }
  } catch (err) {
    console.error(err);
    showMessage('register-message', 'Registration failed—please try again.');
  } finally {
    setButtonLoading(createAccountButton, false);
  }
});

loginButton.addEventListener('click', async () => {
  hideMessage('login-message');
  setButtonLoading(loginButton, true);

  const email    = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  if (!email || !password) {
    showMessage('login-message', 'Please enter both email and password.');
    setButtonLoading(loginButton, false);
    return;
  }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    showMessage('login-message', 'Please enter a valid email address.');
    setButtonLoading(loginButton, false);
    return;
  }
  try {
    const res = await fetch(
      'https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/login',
      {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ email, password })
      }
    );

    const data = await res.json();

    if (res.ok) {
      window.location.href = '../home';
    } else {
      showMessage('login-message', data.message || 'Login failed');
    }
  } catch (err) {
    console.error('Login error:', err);
    showMessage('login-message', 'Login failed—please try again.');
  } finally {
    setButtonLoading(loginButton, false);
  }
});
