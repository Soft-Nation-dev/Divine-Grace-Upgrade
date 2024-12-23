
 document.querySelector('.js-prayer-request-button').addEventListener('click', ()=>{
  window.location.href = 'index.html'; 
});
function leftBodySectiondisplay (){
const displayProfileButton = document.querySelector('.js-display-profile-button');
const exitButton = document.querySelector('.js-exit-button');
const leftBodySection = document.querySelector('.left-body-section');
const mainBodySection = document.querySelector('.main-body-section');

const originalMainBodyContent = mainBodySection.innerHTML;

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
  const menuItems = document.querySelectorAll('.menu-item');
  const exitButton = document.querySelector('.js-exit-butt');
  const navMenu = document.querySelector('.nav-menu');
  const mainContent = document.querySelector('.main-content');
  const hamburgerButton = document.querySelector('.js-hambuger-button');
  const dash = document.querySelector('.dash');
  dash.classList.add('connect');

  menuItems.forEach(item => {
    item.addEventListener('click', (event) => {
      event.preventDefault();

      menuItems.forEach(menuItem => menuItem.classList.remove('active'));
      menuItems.forEach(menuItem => menuItem.classList.remove('connect'));

      item.classList.add('active');
      item.classList.add('connect');

      const sections = document.querySelectorAll('section');
      sections.forEach(section => section.classList.add('hidden'));

      const page = item.dataset.page;
      const sectionToShow = document.querySelector(`#${page}-section`);
      if (sectionToShow) {
        sectionToShow.classList.remove('hidden');
      }

      navMenu.classList.remove('visible');
      mainContent?.classList.remove('blurred'); 
    });
  });

  window.addEventListener('load', () => {
    const activeMenu = localStorage.getItem('activeMenu');
    if (activeMenu) {
      const activeItem = document.querySelector(`.menu-item[data-page="${activeMenu}"]`);
      if (activeItem) {
        activeItem.classList.add('active');
        activeItem.classList.add('connect');
      }
    }
  });

  if (hamburgerButton && navMenu) {
    hamburgerButton.addEventListener('click', () => {
      navMenu.classList.toggle('visible');
      mainContent?.classList.toggle('blurred', navMenu.classList.contains('visible'));

      if (exitButton && navMenu) {
        exitButton.addEventListener('click', () => {
          navMenu.classList.remove('visible');
          mainContent?.classList.remove('blurred');
        });
      }

      if (navMenu.classList.contains('visible')) {
        mainContent?.classList.add('blurred');
      } else {
        mainContent?.classList.remove('blurred');
      }
    });
  }

  const signOutButton = document.querySelector('.js-sign-out-button');

  if (signOutButton) {
    signOutButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
      }
    });
  }


document.addEventListener('DOMContentLoaded', () => {
  const menuItems = document.querySelectorAll('.menu-item');
  const contentSections = document.querySelectorAll('.content-section');

  function showPage(pageId) {
    contentSections.forEach(section => {
      section.classList.add('hidden'); 
    });
    const activePage = document.getElementById(`${pageId}-content`);
    if (activePage) activePage.classList.remove('hidden'); 
  }

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.dataset.page;
      showPage(pageId);

      menuItems.forEach(menuItem => menuItem.classList.remove('active'));
      item.classList.add('active');
    });
  });

  showPage('dashboard');
});

}



renderHeader();
leftBodySectiondisplay();