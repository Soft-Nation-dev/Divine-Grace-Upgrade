export function setButtonLoading(buttonEl, isLoading) {
    const text = buttonEl.querySelector('.btn-text');
    const spinner = buttonEl.querySelector('.spinner');
    if (isLoading) {
      buttonEl.disabled = true;
      text.style.display = 'none';    
      buttonEl.classList.add('loading'); 
      spinner.classList.remove('spinner--hidden');
    } else {
      buttonEl.disabled = false;
      buttonEl.classList.remove('loading')
      spinner.classList.add('spinner--hidden');
      text.style.display = '';                 
    }
  }
  
export function toggleVisibility(hide, show) {
    hide.forEach(div => div.classList.replace('visible','hidden'));
    show.forEach(div => div.classList.replace('hidden','visible'));
  }  


 export function renderHeader() {
    const hamburgerButton = document.querySelector('.js-hambuger-button');
    const exitNavButton   = document.querySelector('.js-exit-butt');
    const navMenu         = document.querySelector('.nav-menu');
    const mainContent     = document.querySelector('.main-content');
  
    if (!hamburgerButton || !navMenu) return;
  
    // open/close via hamburger
    hamburgerButton.addEventListener('click', () => {
      navMenu.classList.toggle('visible');
      mainContent.classList.toggle('blurred', navMenu.classList.contains('visible'));
    });
  
    // close via exit icon
    if (exitNavButton) {
      exitNavButton.addEventListener('click', () => {
        navMenu.classList.remove('visible');
        mainContent.classList.remove('blurred');
      });
    }
  }
  
 export  function wireLogout() {
    const signOutButton = document.querySelector('.js-sign-out-button');
    if (!signOutButton) return;
  
    signOutButton.addEventListener('click', async () => {
      try {
        const res = await fetch(
          'https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/logout',
          { method: 'POST', credentials: 'include' }
        );
        if (res.ok) {
          alert('Logged out successfully');
          window.location.href = '/Divine-Grace-Upgrade/registerlogin';
        } else {
          alert('Logout failed');
        }
      } catch {
        alert('Logout error—please try again.');
      }
    });
  }
  

  export function PreventBackButton() {
window.history.pushState({}, "", location.href);
window.onpopstate = () => {
  window.location.href = "/Divine-Grace-Upgrade/home"; // Always go back to dashboard
};

  }

  export function makeAdmin() {
    document.getElementById("assign-admin-btn").addEventListener("click", () => {
      const email = prompt("Enter email to assign admin rights:");
      if (!email) return;
  
      fetch("https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/assign-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // Include cookies for auth
        body: JSON.stringify({ email })
      })
        .then(response => {
          if (response.status === 401 || response.redirected) {
            alert("You are not authorized. Please log in first.");
            window.location.href = "/login.html"; // Replace with your actual login page path
            return;
          }
  
          if (response.ok) {
            alert("Admin privileges granted successfully.");
          } else {
            response.text().then(text => {
              alert("Failed to assign admin: " + text);
            });
          }
        })
        .catch(error => {
          console.error("Error:", error);
          alert("An error occurred while assigning admin.");
        });
    });
  }
  
  
 