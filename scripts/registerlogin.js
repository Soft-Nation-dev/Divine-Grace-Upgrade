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


function setButtonLoading(buttonEl, isLoading) {
  const text = buttonEl.querySelector('.btn-text');
  const spinner = buttonEl.querySelector('.spinner');
  if (isLoading) {
    buttonEl.disabled = true;
    text.style.display = 'none';    
    buttonEl.classList.add('loading'); 
    spinner.classList.remove('spinner--hidden');
  } else {
    buttonEl.disabled = false;
    buttonEl.classList.remove('loading')
    spinner.classList.add('spinner--hidden');
    text.style.display = '';                 // restore text display
  }
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
  setButtonLoading(createAccountButton, true);
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
    alert('Please fill in all fields.');
    setButtonLoading(createAccountButton, false);
    return;
  }
  if (Password !== ConfirmPassword) {
    alert('Passwords do not match.');
    setButtonLoading(createAccountButton, false);
    return;
  }
  if (Password.length < 5) {
    alert('Password must be at least 5 characters long.');
    setButtonLoading(createAccountButton, false);
    return;
  }
  if (!/^[a-zA-Z0-9]+$/.test(Username)) {
    alert('Username can only contain letters and numbers.');
    setButtonLoading(createAccountButton, false);
    return;
  }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(Email)) {
    alert('Please enter a valid email address.');
    setButtonLoading(createAccountButton, false);
    return;
  }
  if (!/^\d{10}$/.test(PhoneNumber)) {
    alert('Phone number must be exactly 10 digits long.');
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
  } finally {
    setButtonLoading(createAccountButton, false);
  }
});

// ---- LOGIN HANDLER ----
loginButton.addEventListener('click', async () => {
  setButtonLoading(loginButton, true);
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    alert('Please enter both email and password.');
    setButtonLoading(loginButton, false);
    return;
  }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    alert('Please enter a valid email address.');
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
  } finally {
    setButtonLoading(loginButton, false);
  }
});
