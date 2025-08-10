import { renderHeader, wireLogout, PreventBackButton, checkSession, loadProfilePicture, returnHome, preventBackCacheReload } from "./utils.js";


renderHeader(); 
wireLogout();
checkSession(); 
preventBackCacheReload();
returnHome();
PreventBackButton();
loadProfilePicture();
document.getElementById("invite-form").classList.add("hiddenn");
async function loadInvitations() {
  const container = document.getElementById("invites-box");
  container.innerHTML = `<p class="loading-msg">Loading invitations...</p>`;

  try {
    const res = await fetch(
      "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/Invitation/my-invitations",
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json().catch(() => []);

    if (!res.ok) {
      throw new Error(data.message || "Unable to fetch invitations");
    }

    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = `<p class="empty-msg">No invitations found.</p>`;
      return;
    }

    data.filter(invite => invite.invitedName && invite.invitedPhoneNumber).forEach((invite) => {
    const card = document.createElement("div");
    card.className = "invite-card";
    card.innerHTML = `
      <h3>${invite.invitedName}</h3>
      <p><strong>Phone:</strong> ${invite.invitedPhoneNumber}</p>
    `;
    container.appendChild(card);
  });

  } catch (error) {
    container.innerHTML = `<p class="error-msg">Failed to load invitations. Please try again later.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadInvitations);






document.getElementById("add-invite-btn").addEventListener("click", () => {
  document.getElementById("invites-box").style.display = "none";
  document.getElementById("add-invite-btn").style.display = "none";
  document.getElementById("invite-form").classList.remove("hiddenn");
});

document.getElementById("cancel-invite-btn").addEventListener("click", () => {
  document.getElementById("invite-form").classList.add("hiddenn");
  document.getElementById("invites-box").style.display = "flex";
  document.getElementById("add-invite-btn").style.display = "inline-block";

  document.getElementById("invite-name").value = '';
  document.getElementById("invite-phone").value = '';
});



document.getElementById("submit-invite-btn").addEventListener("click", async () => {
  const nameInput = document.getElementById("invite-name");
  const phoneInput = document.getElementById("invite-phone");
  const InvitedName = nameInput.value.trim();
  const InvitedPhoneNumber = phoneInput.value.trim();
  const submitButton = document.getElementById("submit-invite-btn");

  if (!InvitedName || !InvitedPhoneNumber) {
    alert("Please fill all fields.");
    return;
  }

  submitButton.textContent = "Submitting...";
  submitButton.style.backgroundColor = "#444"; 
  submitButton.disabled = true;

  try {
    const response = await fetch('https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', 
        
    });

    if (!response.ok) {
      throw new Error(`Failed with status: ${response.status}`);
    }

    const overlay = document.getElementById("success-overlay");
    const spinner = overlay.querySelector(".success-spinner");
    const checkmark = overlay.querySelector(".success-checkmark");

    overlay.classList.add("show");

    setTimeout(() => {
      spinner.style.display = "none";
      checkmark.classList.add("show");
    }, 1200);

    setTimeout(() => {
      overlay.classList.remove("show");
      spinner.style.display = "block";
      checkmark.classList.remove("show");

      nameInput.value = "";
      phoneInput.value = "";

      document.getElementById("invite-form").classList.add("hiddenn");
      document.getElementById("invites-box").style.display = "flex";
      document.getElementById("add-invite-btn").style.display = "inline-block";

      submitButton.textContent = "Submit";
      submitButton.style.backgroundColor = "";
        submitButton.disabled = false;
        loadInvitations()
    }, 4000);

  } catch (error) {
    alert("Submission failed. Please try again.");

    submitButton.textContent = "Submit";
    submitButton.style.backgroundColor = "";
    submitButton.disabled = false;
  }
});

