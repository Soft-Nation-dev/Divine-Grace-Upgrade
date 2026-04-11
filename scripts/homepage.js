import { renderHeader, wireLogout, PreventBackButton, loadProfilePicture, returnHome, preventBackCacheReload, checkSession} from "./utils.js";
import { loadUserData } from "./userdata.js";
 
function leftBodySectionDisplay() {
  const displayProfileButton = document.querySelector('.js-display-profile-button');
  const exitButton           = document.querySelector('.js-exit-button');
  const leftBodySection      = document.querySelector('.left-body-section');
  const mainBodySection      = document.querySelector('.main-body-section');

  if (!displayProfileButton || !exitButton || !leftBodySection || !mainBodySection) {
    return;
  }

  const handleProfileOpen = () => {
    leftBodySection.classList.add('fullscreen');
    mainBodySection.classList.add('hidden');
    if (window.innerWidth > 768) {
      document.body.appendChild(leftBodySection);
      exitButton.style.display = 'block';
    }
  };

  const handleProfileClose = () => {
    leftBodySection.classList.remove('fullscreen');
    mainBodySection.classList.remove('hidden');
    exitButton.style.display = 'none';
    if (window.innerWidth > 768) {
      const mainSection = document.querySelector('.main-body-section');
      if (mainSection) {
        mainSection.insertBefore(leftBodySection, mainSection.firstChild);
      }
    }
  };

  displayProfileButton.addEventListener('click', handleProfileOpen);
  exitButton.addEventListener('click', handleProfileClose);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && leftBodySection.classList.contains('fullscreen')) {
      handleProfileClose();
    }
  });
}





window.addEventListener('DOMContentLoaded', () => {
  leftBodySectionDisplay();
  preventBackCacheReload();
  checkSession();
  renderHeader();
  loadUserData();
  returnHome();
  wireLogout();
  PreventBackButton();
  loadProfilePicture();
});
