function leftBodySectionDisplay() {
  const displayProfileButton = document.querySelector('.js-display-profile-button');
  const exitButton = document.querySelector('.js-exit-button');
  const leftBodySection = document.querySelector('.left-body-section');
  const mainBodySection = document.querySelector('.main-body-section');

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

    const parentSection = document.querySelector('.main-body-section');
    parentSection.insertBefore(leftBodySection, parentSection.firstChild);
  });
}

export function renderHeader() {
  const hamburgerButton = document.querySelector('.js-hambuger-button');
  const exitButton = document.querySelector('.js-exit-butt');
  const navMenu = document.querySelector('.nav-menu');
  const mainContent = document.querySelector('.main-content');

  // Toggle nav menu visibility
  if (hamburgerButton && navMenu) {
    hamburgerButton.addEventListener('click', () => {
      navMenu.classList.toggle('visible');
      mainContent?.classList.toggle('blurred', navMenu.classList.contains('visible'));
    });

    if (exitButton) {
      exitButton.addEventListener('click', () => {
        navMenu.classList.remove('visible');
        mainContent?.classList.remove('blurred');
      });
    }
  }

  // Handle navigation actions
  document.addEventListener('click', (event) => {
    if (event.target.matches('.submit-prayer')) {
      window.location.href = 'prayerequest.html';
    }
  });

  // Populate dynamic content
  const userName = document.getElementById('user-name');
  const firstName = document.getElementById('user-firstname');
  const userPhone = document.getElementById('user-phone');
  const userEmail = document.getElementById('user-email');
  const userAddress = document.getElementById('user-address');
  const userSchoolDepartment = document.getElementById('user-school-department');
  const userDepartment = document.getElementById('user-department');
  const welcomeMessage = document.getElementById('welcome-message');
  const signOutButton = document.querySelector('.js-sign-out-button');

  function loadUserData() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser) {
      const user = users.find(u => u.email === loggedInUser.email);

      if (user) {
        // Update UI with user data
        userName.textContent = `${user.firstname} ${user.name}`;
        firstName.textContent = user.firstname;
        userPhone.textContent = user.phone;
        userEmail.textContent = user.email;
        userAddress.textContent = user.address || 'Not provided';
        userSchoolDepartment.textContent = user.schoolDepartment || 'Not provided';
        userDepartment.textContent = user.churchDepartment || 'Not provided';
        // welcomeMessage.textContent = `Welcome back, ${user.firstname}`;
      }
    } else {
      // Redirect to login if no user is logged in
      window.location.href = 'index.html';
    }
  }

  // Sign-out functionality
  if (signOutButton) {
    signOutButton.addEventListener('click', () => {
      localStorage.removeItem('loggedInUser'); // Remove logged-in user data
      alert('You have been signed out.');
      window.location.href = 'index.html'; // Redirect to login page
    });
  }

  // Load user data when the page loads
  loadUserData();
}

renderHeader();
leftBodySectionDisplay();
