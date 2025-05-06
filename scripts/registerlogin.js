function reset() {
  document.querySelectorAll('.creatacc-div input').forEach(i => i.value = '');
}

const signIn   = document.querySelector('.js-signinbut');
const signUp   = document.querySelector('.js-signupbut');
const createAccountSection = document.querySelector('.creatacc-div');
const welcomeBackSection   = document.querySelector('.signin-div');
const helloDiv             = document.querySelector('.hello-div');
const welcomeDiv           = document.querySelector('.welcomeback-div');
const loginButton          = document.querySelector('.js-login-button');
const createAccountButton  = document.querySelector('.js-create-account-button');

// Initial visibility setup
createAccountSection.classList.add('visible');
helloDiv.classList.add('visible');
welcomeDiv.classList.add('hidden');
welcomeBackSection.classList.add('hidden');

function toggleVisibility(hide, show) {
  hide.forEach(div => div.classList.replace('visible','hidden'));
  show.forEach(div => div.classList.replace('hidden','visible'));
}

signIn.addEventListener('click', () => {
  toggleVisibility([createAccountSection, helloDiv], [welcomeBackSection, welcomeDiv]);
});
signUp.addEventListener('click', () => {
  toggleVisibility([welcomeBackSection, welcomeDiv], [createAccountSection, helloDiv]);
});

function $(id) {
  const el = document.getElementById(id);
  if (!el) console.error(`❌ Missing element with id="${id}"`);
  return el;
}

// Input fields
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

// ---- REGISTRATION HANDLER ----
createAccountButton.addEventListener('click', async () => {
  const FirstName       = firstnameInput.value.trim();
  const Othername            = nameInput.value.trim();
  const Username            = userNameInput.value.trim();
  const DepartmentInChurch     = deptChurchInput.value.trim();
  const DepartmentInSchool= deptSchoolInput.value.trim();
  const ResidentialAddress         = addressInput.value.trim();
  const Email           = emailInput.value.trim();
  const PhoneNumber           = phoneInput.value.trim();
  const Password        = passwordInput.value;
  const ConfirmPassword = confirmPasswordInput.value;

  if (![ FirstName, Othername, DepartmentInChurch, DepartmentInSchool, ResidentialAddress, Email, PhoneNumber, Password, ConfirmPassword ].every(v => v)) {
    return alert('Please fill in all fields.');
  }
  if (Password !== ConfirmPassword) {
    return alert('Passwords do not match.');
  }
  if (Password.length < 8) {
    return alert('Password must be at least 8 characters long.');
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
          Othername,
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
      alert(data.message);
      toggleVisibility(
        [createAccountSection, helloDiv],
        [welcomeBackSection, welcomeDiv]
      );
      reset();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Registration failed—please try again.');
  }
});

// ---- LOGIN HANDLER ----
loginButton.addEventListener('click', async () => {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    return alert('Please enter both email and password.');
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
      // Simplified success message—no firstname lookup here
      alert('Login successful! Redirecting you to the dashboard…');
      window.location.href = 'homepage.html';
    } else {
      // Show the server-side error message
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Login failed—please try again.');
  }
});
