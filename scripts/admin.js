import { renderHeader, wireLogout, PreventBackButton, makeAdmin, checkSession } from "./utils.js";

renderHeader();
wireLogout();
checkSession();
PreventBackButton();

function showLoader(message) {
  const loader = document.getElementById("admin-loader");
  const statusText = document.getElementById("loader-text");
  const icon = document.getElementById("loader-icon");

  statusText.textContent = message;
  icon.innerHTML = "";
  loader.style.display = "flex";
}

function updateLoader(status, success) {
  const icon = document.getElementById("loader-icon");
  icon.innerHTML = success
    ? '<div class="loader-check">✔</div>'
    : '<div class="loader-error">✖</div>';
  document.getElementById("loader-text").textContent = status;
}

function hideLoader() {
  document.getElementById("admin-loader").style.display = "none";
}

async function isAdmin() {
  const res = await fetch(
    "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/isAadmin",
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!res.ok) {
    console.error("Admin check failed:", res.status);
    return false;
  }

  return await res.json();
}

function setupTabSwitching() {
  const prayerSection = document.getElementById("prayer-section");
  const lstsSection = document.getElementById("lsts-section");
  const messageSection = document.getElementById("message-section");

  const showPrayersBtn = document.getElementById("show-prayers-btn");
  const showLstsBtn = document.getElementById("show-lsts-btn");
  const showMessagesBtn = document.getElementById("show-messages-btn");

  prayerSection.style.display = "none";
  lstsSection.style.display = "none";
  messageSection.style.display = "none";

  showPrayersBtn.addEventListener("click", () => {
    prayerSection.style.display = "block";
    lstsSection.style.display = "none";
    messageSection.style.display = "none";
  });

  showLstsBtn.addEventListener("click", () => {
    prayerSection.style.display = "none";
    lstsSection.style.display = "block";
    messageSection.style.display = "none";
  });

  showMessagesBtn.addEventListener("click", () => {
    prayerSection.style.display = "none";
    lstsSection.style.display = "none";
    messageSection.style.display = "block";
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const messageContainer = document.getElementById("message-container");
  const mainContent = document.getElementById("main");
  const uploadForm = document.getElementById("upload-form");

  showLoader("Checking admin access...");

  const isAdminUser = await isAdmin();

  setTimeout(async () => {
    if (!isAdminUser) {
      updateLoader("You are not an admin", false);
      setTimeout(() => {
        window.location.href = "../home";
      }, 2000);
      return;
    }

    updateLoader("Access granted", true);

    setTimeout(() => {
      hideLoader();
      mainContent.style.display = "block";
    }, 1500);

    const prayerContainer = document.getElementById("prayer-requests");
    const lstsContainer = document.getElementById("lsts-registrations");

    const prayerEndpoint = "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/GetPrayers";
    const lstsEndpoint = "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/USERLSTSFORM";

    async function fetchAndDisplayPrayers() {
      try {
        const res = await fetch(prayerEndpoint, { credentials: "include" });
        const data = await res.json();
        console.log("Prayer Requests:", data);
        if (!Array.isArray(data)) throw new Error("Unexpected response");

        data.forEach(req => {
          const card = document.createElement("div");
          card.className = "admin-card";
          card.innerHTML = `
            <p><strong>Name:</strong> ${req.firstName} ${req.otherNames}</p>
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
        console.log("LSTS Data:", data);
        if (!Array.isArray(data)) throw new Error("Unexpected response");

        data.forEach(person => {
          const {
            surname = "",
            otherNames = "",
            phoneNumber = "",
            email = "",
            residentialAddress = "",
            departmentInChurch = "",
            positionInChurch = "",
            gender = "",
            student = "",
            departmentInSchool = "",
            level = "",
            submittedAt = ""
          } = person;

          let submittedAtFormatted = "N/A";
          const parsedDate = new Date(submittedAt);
          if (!isNaN(parsedDate)) {
            submittedAtFormatted = parsedDate.toLocaleString();
          }

          const card = document.createElement("div");
          card.className = "admin-card";
          card.innerHTML = `
            <p><strong>Surname:</strong> ${surname}</p>
            <p><strong>Other Names:</strong> ${otherNames}</p>
            <p><strong>Phone:</strong> ${phoneNumber}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Residential Address:</strong> ${residentialAddress}</p>
            <p><strong>Department in Church:</strong> ${departmentInChurch}</p>
            <p><strong>Position:</strong> ${positionInChurch}</p>
            <p><strong>Gender:</strong> ${gender}</p>
            <p><strong>Is Student:</strong> ${student}</p>
            ${
              student.toLowerCase() === "yes"
                ? `<p><strong>Dept. in School:</strong> ${departmentInSchool}</p>
                   <p><strong>Level:</strong> ${level}</p>`
                : ""
            }
            <p><strong>Submitted At:</strong> ${submittedAtFormatted}</p>
          `;
          lstsContainer.appendChild(card);
        });
      } catch (err) {
        console.error("Failed to fetch LSTS registrations:", err);
        lstsContainer.innerHTML = "<p class='error'>Could not load LSTS registrations.</p>";
      }
    }

    await Promise.all([fetchAndDisplayPrayers(), fetchAndDisplayLSTS()]);
    setupTabSwitching();

    // PDF download logic
    function downloadSectionAsPDF(sectionId, filename) {
      const section = document.getElementById(sectionId);
      if (!section) return;

      const options = {
        margin: 10,
        filename: `${filename}_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(section).set(options).save();
    }

    document.getElementById("download-prayers-btn").addEventListener("click", () => {
      downloadSectionAsPDF("prayer-requests", "Prayer_Requests");
    });

    document.getElementById("download-lsts-btn").addEventListener("click", () => {
      downloadSectionAsPDF("lsts-registrations", "LSTS_Registrations");
    });
  }, 3000);

  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const fileInput = document.getElementById("file");
    const file = document.getElementById("audioFileInput").files[0];
    const statusDiv = document.getElementById("upload-status");

    if (!title || !category || !date || !file) {
      statusDiv.textContent = "❌ Please fill all fields and select a file.";
      statusDiv.className = "status-error";
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("date", date);
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/AudioMessage", true);
    xhr.withCredentials = true;

    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        statusDiv.textContent = `🔄 Uploading: ${percent}%`;
        statusDiv.className = "status-uploading";
      }
    };

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);
        console.log("Success:", result);
        statusDiv.textContent = "✅ Upload successful!";
        statusDiv.className = "status-success";
      } else {
        console.error("Upload failed:", xhr.statusText);
        statusDiv.textContent = "❌ Upload failed.";
        statusDiv.className = "status-error";
      }
    };

    xhr.onerror = function () {
      console.error("Network error during upload.");
      statusDiv.textContent = "❌ Upload failed.";
      statusDiv.className = "status-error";
    };

    xhr.send(formData);
  });

  makeAdmin();
});
