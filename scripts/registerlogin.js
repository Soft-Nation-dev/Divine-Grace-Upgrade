console.log('working')

function generateRegisterHtml (){
    let registerloginHtml = '';
    registerloginHtml = `  <div class="fisrt-div">
            <div class="first">
                <h2>Creat Account</h2>
                <input class="input" type="text" placeholder="Name">
                <input class="input" type="text" placeholder="Email">
                <input class="input" type="number" placeholder="Phone number">
               <div class="button-div">
                  <button>Creat Account</button>
               </div>
            </div>
            <div class="second">
                <h2>Hello Friend!</h2>
                <p>Enter your perssonal details to start you journey with us</p>
                <div class="button-div"><button id="sign">Sign In</button></div>
            </div>
        </div>  `;

};

function generateloginHtml (){
    let loginHtml = '';
    loginHtml = `    <div class="second-div"> 
                <div class="first">
                    <h2>Sign In</h2>
                    <input class="input" type="text" placeholder="Email">
                    <input class="input" type="number" placeholder="Phone number">
                   
                    <div class="button-div">
                    <a href="">Forgot your password?</a>
                    <button>Log In</button>
                    </div>
        </div>
        <div class="second">
            <h2>Welcome Back!</h2>
            <p>Kindly input your personal info to login</p>
            <div class="button-div"><button id="sign">Sign Up</button></div>
        </div>
    </div>`;
};

const registerloginsec = document.querySelector('.js-registerlogin');
const signIn = document.querySelector('.js-signinbut');
const signUp = document.querySelector('.js-signupbut');

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
