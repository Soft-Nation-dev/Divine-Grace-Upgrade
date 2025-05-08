import { renderHeader } from "./utils.js";
import { wireLogout } from "./utils.js";
 
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


async function loadUserData() {
  try {
    const res = await fetch(
      'https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/profile',
      { method: 'GET',
       credentials: 'include' }
    );
    
    const user = await res.json();

    document.getElementById('user-name').textContent                = `${user.firstName} ${user.otherNames}`;
    document.getElementById('user-department').textContent          = user.departmentInChurch   || '—';
    document.getElementById('user-phone').textContent               = user.phoneNumber  || '—';
    document.getElementById('user-email').textContent               = user.email;
    document.getElementById('user-address').textContent             = user.residentialAddress     || '—';
    document.getElementById('user-school-department').textContent   = user.departmentInSchool || '—';
    document.getElementById('user-firstname').textContent           = user.userName || '—';
    document.getElementById('welcome-message').textContent          = `Welcome back, ${user.userName}`;
  } catch (err) {
    console.error(err);
    alert('Failed to load user data. Please try again later.');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  leftBodySectionDisplay();
  renderHeader();
  loadUserData();
  wireLogout();
});
