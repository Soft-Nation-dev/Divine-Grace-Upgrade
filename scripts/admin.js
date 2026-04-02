import {
  renderHeader,
  wireLogout,
  PreventBackButton,
  makeAdmin,
  checkSession,
  loadProfilePicture,
  returnHome,
  preventBackCacheReload,
  authHeaders
} from "./utils.js";

renderHeader();
wireLogout();
checkSession();
loadProfilePicture();

const backendBaseUrl = window._backendUrl || "http://127.0.0.1:8787";
preventBackCacheReload();
returnHome();
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
  const res = await fetch(`${backendBaseUrl}/api/admin/check`, {
    method: "GET",
    headers: authHeaders()
  });

  if (!res.ok) {
    return false;
  }

  const data = await res.json().catch(() => ({}));
  return data?.isAdmin === true;
}

function setupTabSwitching() {
  const sections = {
    "lsts-section": "show-lsts-btn",
    "prayer-section": "show-prayers-btn",
    "message-section": "show-messages-btn",
    "invites-section": "show-invites-btn"
  };

  for (const [sectionId, buttonId] of Object.entries(sections)) {
    document.getElementById(buttonId).addEventListener("click", () => {
      for (const sid of Object.keys(sections)) {
        document.getElementById(sid).style.display = "none";
      }
      document.getElementById(sectionId).style.display = "block";
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const messageContainer = document.getElementById("message-container");
  const mainContent = document.getElementById("main");
  const uploadForm = document.getElementById("upload-form");
  const invitesContainer = document.getElementById("invites-container");

  showLoader("Checking admin access...");
  let isAdminUser = false;
  try {
    isAdminUser = await isAdmin();
  } catch (err) {
    isAdminUser = false;
  }

  setTimeout(async () => {
    if (!isAdminUser) {
      updateLoader("You are not an admin", false);
      setTimeout(() => window.location.href = "../home", 2000);
      return;
    }

    updateLoader("Access granted", true);
    setTimeout(() => {
      hideLoader();
      mainContent.style.display = "block";
    }, 1500);

    const prayerContainer = document.getElementById("prayer-requests");
    const lstsContainer = document.getElementById("lsts-registrations");

    const endpoints = {
      invites: null,
      prayers: `${backendBaseUrl}/api/admin/prayers/all`,
      lsts: `${backendBaseUrl}/api/admin/lsts/all`
    };

    const normalizeLsts = (person) => ({
      surname: person.surname || "",
      otherNames: person.other_names || person.otherNames || "",
      phoneNumber: person.phone_number || person.phoneNumber || "",
      email: person.email || "",
      residentialAddress: person.residential_address || person.residentialAddress || "",
      departmentInChurch: person.department_in_church || person.departmentInChurch || "",
      positionInChurch: person.position_in_church || person.positionInChurch || "",
      gender: person.gender || "",
      student: person.is_student === true ? "Yes" : "No",
      departmentInSchool: person.department_in_school || person.departmentInSchool || "",
      level: person.level || "",
      submittedAt: person.submitted_at || person.submittedAt || null,
    });

    const normalizePrayer = (item) => ({
      title: item.title || "Untitled",
      description: item.description || "",
      category: item.category || "General",
      urgency: item.urgency || "Normal",
      submittedAt: item.submitted_at || item.submittedAt || null,
      email: item.user_email || item.email || "",
    });
    
    async function fetchAndDisplayLSTS() {
   try {
     const res = await fetch(endpoints.lsts, { headers: authHeaders() });
    const data = await res.json();
    const registrations = Array.isArray(data) ? data : data?.registrations;
    if (!Array.isArray(registrations)) throw new Error("Unexpected response");
 
 
     const now = new Date();
 
     
     const dayOfWeek = now.getDay(); 
     const monday = new Date(now);
     monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); 
     monday.setHours(0, 0, 0, 0);
 
     const friday = new Date(monday);
     friday.setDate(monday.getDate() + 4);
     friday.setHours(23, 59, 59, 999);
 
     const normalized = registrations.map(normalizeLsts);

     const thisWeeksData = normalized.filter(person => {
       if (!person.submittedAt) return false;
       const submitted = new Date(person.submittedAt);
       return submitted >= monday && submitted <= friday;
     });
 
     lstsContainer.innerHTML = ""; 
     const allContainer = document.getElementById("lsts-registrations-all");
     allContainer.innerHTML = "";
 
     if (thisWeeksData.length === 0) {
       lstsContainer.innerHTML = "<p class='error'>No LSTS registration for this week.</p>";
     }  else {
       renderLSTSList(thisWeeksData, lstsContainer);
     }
 
    renderLSTSList(normalized, allContainer);
     
     } catch {
     lstsContainer.innerHTML = "<p class='error'>Could not load LSTS registrations.</p>";
       document.getElementById("lsts-registrations-all").innerHTML = "";
   }
 }
    async function fetchAndDisplayPrayers() {
      try {
        const res = await fetch(endpoints.prayers, { headers: authHeaders() });
        const data = await res.json();
        const prayers = Array.isArray(data) ? data : data?.prayers;
        if (!Array.isArray(prayers)) throw new Error("Unexpected response");

        const normalized = prayers.map(normalizePrayer);

        normalized.forEach(req => {
          const card = document.createElement("div");
          card.className = "admin-card";
          card.innerHTML = `
            <p><strong>Title:</strong> ${req.title}</p>
            <p><strong>Message:</strong> ${req.description}</p>
            <p><strong>Category:</strong> ${req.category}</p>
            <p><strong>Urgency:</strong> ${req.urgency}</p>
            <p><strong>Submitted By:</strong> ${req.email || "Unknown"}</p>
            <p><strong>Submitted At:</strong> ${req.submittedAt ? new Date(req.submittedAt).toLocaleString() : "Unknown"}</p>
          `;
          prayerContainer.appendChild(card);
        });
      } catch {
        prayerContainer.innerHTML = "<p class='error'>Could not load prayer requests.</p>";
      }
    }


function renderLSTSList(list, container) {
  list.forEach(person => {
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
      <p><strong>Is Student:</strong> ${person.student}</p>
      ${person.student?.toLowerCase() === "yes" ? `
        <p><strong>Dept. in School:</strong> ${person.departmentInSchool}</p>
        <p><strong>Level:</strong> ${person.level}</p>` : ""
      }
      <p><strong>Submitted At:</strong> ${person.submittedAt ? new Date(person.submittedAt).toLocaleString() : "Unknown"}</p>
    `;
    container.appendChild(card);
  });
}


    async function fetchAndDisplayInvites() {
      if (!endpoints.invites) {
        invitesContainer.innerHTML = "<p class='error'>Invites admin endpoint is not configured in this branch backend yet.</p>";
        return;
      }

      try {
        const res = await fetch(endpoints.invites, { headers: authHeaders() });
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Unexpected response");

        invitesContainer.innerHTML = "";
        data.forEach(user => {
          const userHeader = document.createElement("div");
          userHeader.className = "user-section";
          userHeader.innerHTML = `
            <p>${user.fullName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
          `;
          invitesContainer.appendChild(userHeader);

          if (Array.isArray(user.invitations) && user.invitations.length > 0) {
            const invitesWrapper = document.createElement("div");
            invitesWrapper.className = "invite-grid";

            user.invitations.forEach(invite => {
              const card = document.createElement("div");
              card.className = "admin-card";
              card.innerHTML = `
                <p><strong>Number:</strong> ${invite.number}</p>
                <p><strong>Name:</strong> ${invite.invitedName || "N/A"}</p>
                <p><strong>Phone:</strong> ${invite.invitedPhoneNumber || "N/A"}</p>
              `;
              invitesWrapper.appendChild(card);
            });

            invitesContainer.appendChild(invitesWrapper);
          } else {
            invitesContainer.innerHTML += "<p>No invitations yet.</p>";
          }
        });
      } catch {
        invitesContainer.innerHTML = "<p class='error'>Could not load invitation records.</p>";
      }
    }

    await Promise.all([
      fetchAndDisplayPrayers(),
      fetchAndDisplayLSTS(),
      fetchAndDisplayInvites()
    ]);
    
    setupTabSwitching();

    function downloadSectionAsPDF(sectionId, filename) {
      const section = document.getElementById(sectionId);
      if (!section) return;

      html2pdf().from(section).set({
        margin: 10,
        filename: `${filename}_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save();
    }

    document.getElementById("download-prayers-btn").addEventListener("click", () => {
      downloadSectionAsPDF("prayer-requests", "Prayer_Requests");
    });

   document.getElementById("download-lsts-btn").addEventListener("click", () => downloadSectionAsPDF("lsts-registrations", "LSTS_This_Week"));

  document.getElementById("download-lsts-all-btn").addEventListener("click", () => {
  document.getElementById("lsts-all-preview").style.display = "block";
  // window.scrollTo({ left: 0, behavior: "smooth" });
});

    document.getElementById("close-lsts-all-btn").addEventListener("click", () => {
  document.getElementById("lsts-all-preview").style.display = "none";
});


    document.getElementById("download-invites-btn").addEventListener("click", () => {
      downloadSectionAsPDF("invites-container", "Invitations");
    });

  }, 1000);

  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
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
    xhr.open("POST", `${backendBaseUrl}/api/messages/upload`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${sessionStorage.getItem("authToken")}`);

    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        statusDiv.textContent = `🔄 Uploading: ${percent}%`;
        statusDiv.className = "status-uploading";
      }
    };

    xhr.onload = function () {
      statusDiv.textContent = xhr.status >= 200 && xhr.status < 300
        ? "✅ Upload successful!"
        : "❌ Upload failed.";
      statusDiv.className = xhr.status >= 200 && xhr.status < 300
        ? "status-success"
        : "status-error";
    };

    xhr.onerror = function () {
      statusDiv.textContent = "❌ Upload failed.";
      statusDiv.className = "status-error";
    };

    xhr.send(formData);
  });

  makeAdmin();
});
