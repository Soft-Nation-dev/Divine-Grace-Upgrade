// -----------------------------------
// left‐pane fullscreen toggler
// -----------------------------------
function leftBodySectionDisplay() {
  const displayProfileButton = document.querySelector('.js-display-profile-button');
  const exitButton           = document.querySelector('.js-exit-button');
  const leftBodySection      = document.querySelector('.left-body-section');
  const mainBodySection      = document.querySelector('.main-body-section');

  displayProfileButton.addEventListener('click', () => {
    leftBodySection.classList.add('fullscreen');
    mainBodySection.classList.add('hidden');
    document.body.appendChild(leftBodySection);
    exitButton.style.display = 'block';
  });

  exitButton.addEventListener('click', () => {
    leftBodySection.classList.remove('fullscreen');
    mainBodySection.classList.remove('hidden');
    exitButton.style.display = 'none';
    document.querySelector('.main-body-section')
            .insertBefore(leftBodySection, document.querySelector('.main-body-section').firstChild);
  });
}

// -----------------------------------
// nav menu & hamburger toggler
// -----------------------------------
function renderHeader() {
  const hamburgerButton = document.querySelector('.js-hambuger-button');
  const exitNavButton   = document.querySelector('.js-exit-butt');
  const navMenu         = document.querySelector('.nav-menu');
  const mainContent     = document.querySelector('.main-content');

  if (!hamburgerButton || !navMenu) return;

  // open/close via hamburger
  hamburgerButton.addEventListener('click', () => {
    navMenu.classList.toggle('visible');
    mainContent.classList.toggle('blurred', navMenu.classList.contains('visible'));
  });

  // close via exit icon
  if (exitNavButton) {
    exitNavButton.addEventListener('click', () => {
      navMenu.classList.remove('visible');
      mainContent.classList.remove('blurred');
    });
  }
}

// -----------------------------------
// load user profile from backend
// -----------------------------------
async function loadUserData() {
  try {
    const res = await fetch(
      'https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/profile',
      { method: 'GET',
       credentials: 'include' }
    );
    /*if (!res.ok) {
      return window.location.href = 'registerlogin.html';
    }*/
    const user = await res.json();
    console.log(user);

    document.getElementById('user-name').textContent                = `${user.FirstName} ${user.Othername}`;
    document.getElementById('user-department').textContent          = user.DepartmentInChurch   || '—';
    document.getElementById('user-phone').textContent               = user.PhoneNumber   || '—';
    document.getElementById('user-email').textContent               = user.Email;
    document.getElementById('user-address').textContent             = user.ResidentialAddress      || '—';
    document.getElementById('user-school-department').textContent   = user.DepartmentInSchool || '—';
    document.getElementById('user-firstname').textContent           = user.Username || '—';
    document.getElementById('welcome-message').textContent          = `Welcome back, ${user.FirstName}`;
  } catch (err) {
    console.error(err);
    /*window.location.href = 'registerlogin.html';*/
    alert('Failed to load user data. Please try again later.');
  }
}

// -----------------------------------
// logout action
// -----------------------------------
function wireLogout() {
  const signOutButton = document.querySelector('.js-sign-out-button');
  if (!signOutButton) return;

  signOutButton.addEventListener('click', async () => {
    try {
      const res = await fetch(
        'https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/logout',
        { method: 'POST', credentials: 'include' }
      );
      if (res.ok) {
        alert('Logged out successfully');
        window.location.href = 'registerlogin.html';
      } else {
        alert('Logout failed');
      }
    } catch {
      alert('Logout error—please try again.');
    }
  });
}

// -----------------------------------
// initialize everything on page load
// -----------------------------------
window.addEventListener('DOMContentLoaded', () => {
  leftBodySectionDisplay();
  renderHeader();
  loadUserData();
  wireLogout();
});
