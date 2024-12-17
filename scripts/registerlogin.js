
const registerloginsec = document.querySelector('.js-registerlogin');
const signIn = document.querySelector('.js-signinbut');
const signUp = document.querySelector('.js-signupbut');

document.querySelector('.jslogin-button').addEventListener('click', ()=>{
    console.log('working')
    window.location.href = 'homepage.html';
})

const createAccountSection = document.querySelector('.creatacc-div');
const welcomeBackSection = document.querySelector('.signin-div');
const hellodiv = document.querySelector('.welcomeback-div');
const signindiv = document.querySelector('.hello-div');
createAccountSection.classList.add('visible');
signindiv.classList.add('visible');
hellodiv.classList.add('hidden');
welcomeBackSection.classList.add('hidden');

function toggleVisibility(divsToHide, divsToShow) {
    // Hide the specified divs
    divsToHide.forEach(div => {
        div.classList.add('hidden');
        div.classList.remove('visible');
    });

    // Show the specified divs
    divsToShow.forEach(div => {
        div.classList.add('visible');
        div.classList.remove('hidden');
    });
}

// Event listeners for Sign In and Sign Up buttons
signIn.addEventListener('click', () => {
    if (createAccountSection.classList.contains('visible')) {
        toggleVisibility([createAccountSection, signindiv], [welcomeBackSection, hellodiv]);
    }
});

signUp.addEventListener('click', () => {
    if (!createAccountSection.classList.contains('visible')) {
        toggleVisibility([welcomeBackSection, hellodiv], [createAccountSection, signindiv]);
    }
});
