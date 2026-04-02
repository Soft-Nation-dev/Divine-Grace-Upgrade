import { renderHeader, wireLogout, PreventBackButton, loadProfilePicture, returnHome, preventBackCacheReload, checkSession} from "./utils.js";
import { loadUserData } from "./userdata.js";
 
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
