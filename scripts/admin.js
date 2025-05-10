import { renderHeader, wireLogout, PreventBackButton } from "./utils.js";

renderHeader();
wireLogout();   
PreventBackButton();


const prayerContainer = document.getElementById("prayer-requests");
const lstsContainer = document.getElementById("lsts-registrations");
const loadingText = document.getElementById("loading-text");

const prayerEndpoint = "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/GetPrayers";
const lstsEndpoint = "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/USERLSTSFORM";

async function fetchAndDisplayPrayers() {
  try {
    const res = await fetch(prayerEndpoint, { credentials: "include" });
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Unexpected response");

    data.forEach(req => {
      const card = document.createElement("div");
      card.className = "admin-card";
      card.innerHTML = `
        <p><strong>Message:</strong> ${req.prayerRequest || ""}</p>
        <p><strong>Submitted At:</strong> ${new Date(req.submittedAt).toLocaleString()}</p>
      `;
      prayerContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to fetch prayer requests:", err);
    prayerContainer.innerHTML = "<p class='error'>Could not load prayer requests.</p>";
  }
}

async function fetchAndDisplayLSTS() {
  try {
    const res = await fetch(lstsEndpoint, { credentials: "include" });
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Unexpected response");

    data.forEach(person => {
      const card = document.createElement("div");
      card.className = "admin-card";
      card.innerHTML = `
        <p><strong>Surname:</strong> ${person.surname}</p>
        <p><strong>Other Names:</strong> ${person.otherNames}</p>
        <p><strong>Phone:</strong> ${person.phoneNumber}</p>
        <p><strong>Email:</strong> ${person.email}</p>
        <p><strong>Residential Address:</strong> ${person.residentialAddress}</p>
        <p><strong>Department in Church:</strong> ${person.departmentInChurch}</p>
        <p><strong>Position:</strong> ${person.positionInChurch}</p>
        <p><strong>Gender:</strong> ${person.gender}</p>
        <p><strong>Is Student:</strong> ${person.isStudent}</p>
        ${person.isStudent === "Yes" ? `<p><strong>Dept. in School:</strong> ${person.departmentInSchool}</p><p><strong>Level:</strong> ${person.level}</p>` : ""}
        <p><strong>Submitted At:</strong> ${new Date(person.submittedAt).toLocaleString()}</p>
      `;
      lstsContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to fetch LSTS registrations:", err);
    lstsContainer.innerHTML = "<p class='error'>Could not load LSTS registrations.</p>";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  loadingText.textContent = "Loading prayer requests and LSTS registrations...";
  await Promise.all([fetchAndDisplayPrayers(), fetchAndDisplayLSTS()]);
  loadingText.style.display = "none";
});
