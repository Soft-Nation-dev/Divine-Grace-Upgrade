function reset() {
    const createAccountInputs = document.querySelectorAll('.creatacc-div input');
    createAccountInputs.forEach(input => {
        input.value = '';
    });
}

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
    divsToHide.forEach(div => {
        div.classList.add('hidden');
        div.classList.remove('visible');
    });

    divsToShow.forEach(div => {
        div.classList.add('visible');
        div.classList.remove('hidden');
    });
}

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

const loginButton = document.querySelector('.js-login-button');
const createAccountButton = document.querySelector('.js-create-account-button');

loginButton.addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        alert(`Welcome back, ${user.name}!`);
        window.location.href = 'homepage.html';
    } else {
        alert('Invalid email or password.');
    }
});

createAccountButton.addEventListener('click', () => {
    const name = document.getElementById('register-name').value;
    const firstname = document.getElementById('register-firstname').value;
    const churchDepartment = document.getElementById('department-in-church').value;
    const schoolDepartment = document.getElementById('department-in-school').value;
    const address = document.getElementById('residential-address').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!firstname || !name || !churchDepartment || !schoolDepartment || !address || !email || !phone || !password || !confirmPassword) {
        alert('Please fill in all fields.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.email === email)) {
        alert('This email is already registered.');
        return;
    }

    users.push({ firstname, name, churchDepartment, schoolDepartment, address, email, phone, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Account created successfully!');
    toggleVisibility([createAccountSection, signindiv], [welcomeBackSection, hellodiv]);
    reset();
});
