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

const createAccountSection = document.querySelector('.js-create-account-section');
const welcomeBackSection = document.querySelector('.js-welcome-back-section');


function toggleSections() {
    // Check if the sections are visible
    const isVisible = createAccountSection.style.display !== 'none';
    
    // Toggle visibility
    if (isVisible) {
        createAccountSection.style.display = 'none';
        welcomeBackSection.style.display = 'flex';
    } else {
        createAccountSection.style.display = 'flex';
        welcomeBackSection.style.display = 'none';
    }
}

function toggletrans() {
        // Check the current visibility state of one section
        const isHidden = createAccountSection.classList.contains('hidden');

        if (isHidden) {
            // Show both sections by removing the hidden class
            createAccountSection.classList.remove('hidden');
            welcomeBackSection.classList.add('hidden');
        } else {
            // Hide both sections by adding the hidden class
            createAccountSection.classList.add('hidden');
            welcomeBackSection.classList.remove('hidden');
        }
    }
    



signIn.addEventListener('click', ()=>{
    // toggleSections();
    toggletrans();
    console.log('workig')

});

signUp.addEventListener('click', ()=>{
    // toggleSections();
    toggletrans();
});