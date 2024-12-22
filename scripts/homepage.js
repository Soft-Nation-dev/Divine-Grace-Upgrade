console.log('working')
// const button = document.getElementById('loadNextPageButton');


function buttonAnimation (button, location){
      button.classList.add('fade-out');
      setTimeout(function() {
          window.location.href = location; 
      }, 1500); 
}

const button = document.querySelector('.js-prayer-request-button');

button.addEventListener('click', ()=>{
  buttonAnimation(button, 'index.html');
});

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

