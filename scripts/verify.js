import { renderHeader, wireLogout, PreventBackButton } from "./utils.js";

// Render header and wire up logout and back-button prevention
renderHeader();
wireLogout();
PreventBackButton();

async function isAdmin() {
  const res = await fetch(
    "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/isAadmin ",
    {
      method:      "GET",
      credentials: "include"
    }
  );

  if (!res.ok) {
    console.error("Admin check failed:", res.status);
    return false;
  }

  return await res.json();
}


document.addEventListener("DOMContentLoaded", async () => {
  const show = await isAdmin();
  const messageContainer = document.getElementById("message-container");
  const laod = document.querySelector("load");
  if (show) {
    messageContainer.textContent = "Welcome, Admin! You are being redirected to the Admin Dashboard...";
    messageContainer.style.backgroundColor = "green";
    messageContainer.classList.remove("hiddens");

    setTimeout(() => {
      window.location.href = '/Divine-Grace-Upgrade/Administrator'; 
    }, 2000); 

  } else {
  
  messageContainer.textContent = "You are not an admin. Redirecting you to the Dashboard...";
  laod.textContent = "You are not an admin. Redirecting you to the Dashboard...";
  messageContainer.style.backgroundColor = "red"; 
  messageContainer.classList.remove("hiddens"); 

  
  setTimeout(() => {
    window.location.href = '/Divine-Grace-Upgrade/home'; 
  }, 2000); 
};
});
