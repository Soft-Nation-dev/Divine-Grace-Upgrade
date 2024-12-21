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



document.querySelector('.js-display-profile-button').addEventListener('click', () => {
    const leftBodySection = document.querySelector('.left-body-section');
    const newSection = leftBodySection.cloneNode(true); // Clone the left-body-section

    // Clear the body and append the cloned section
    document.body.innerHTML = '';
    document.body.appendChild(newSection);

    // Add any necessary event listeners again if needed
    console.log("Page content replaced with left-body-section");
});

