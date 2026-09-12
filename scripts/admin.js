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
    const lstsSearch = document.getElementById("lsts-search");
    const lstsWeekRange = document.getElementById("lsts-week-range");
    const lstsWeekCount = document.getElementById("lsts-week-count");
    const lstsStudentCount = document.getElementById("lsts-student-count");
    const lstsDepartmentCount = document.getElementById("lsts-department-count");
    let weeklyLstsData = [];

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
        if (!res.ok) throw new Error(`LSTS request failed with ${res.status}`);

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

        const dateFormat = new Intl.DateTimeFormat(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric"
        });
        lstsWeekRange.textContent = `${dateFormat.format(monday)} – ${dateFormat.format(friday)}`;

        const normalized = registrations
          .map(normalizeLsts)
          .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

        weeklyLstsData = normalized.filter((person) => {
          if (!person.submittedAt) return false;
          const submitted = new Date(person.submittedAt);
          return submitted >= monday && submitted <= friday;
        });

        const departments = new Set(
          weeklyLstsData
            .flatMap((person) => Array.isArray(person.departmentInChurch)
              ? person.departmentInChurch
              : [person.departmentInChurch])
            .filter(Boolean)
        );

        lstsWeekCount.textContent = weeklyLstsData.length;
        lstsStudentCount.textContent = weeklyLstsData.filter((person) => person.student === "Yes").length;
        lstsDepartmentCount.textContent = departments.size;

        renderLSTSList(weeklyLstsData, lstsContainer, "No registrations have been submitted this week.");
        renderLSTSList(normalized, document.getElementById("lsts-registrations-all"), "No LSTS registrations found.");
      } catch (error) {
        console.error("Could not load LSTS registrations:", error);
        lstsWeekRange.textContent = "Weekly records are temporarily unavailable";
        lstsWeekCount.textContent = "—";
        lstsStudentCount.textContent = "—";
        lstsDepartmentCount.textContent = "—";
        lstsContainer.innerHTML = "<p class='admin-empty-state error'>Could not load LSTS registrations.</p>";
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


    const escapeHtml = (value) => String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

    function renderLSTSList(list, container, emptyMessage = "No registrations found.") {
      container.innerHTML = "";
      if (!list.length) {
        container.innerHTML = `<p class="admin-empty-state">${escapeHtml(emptyMessage)}</p>`;
        return;
      }

      list.forEach((person) => {
        const card = document.createElement("article");
        card.className = "admin-card lsts-registration-card";
        const fullName = `${person.surname} ${person.otherNames}`.trim() || "Unnamed registrant";
        const department = Array.isArray(person.departmentInChurch)
          ? person.departmentInChurch.join(", ")
          : person.departmentInChurch || "Not provided";
        const submittedAt = person.submittedAt
          ? new Date(person.submittedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
          : "Date unavailable";

        card.innerHTML = `
          <div class="lsts-card-header">
            <div>
              <p class="lsts-card-kicker">${escapeHtml(person.positionInChurch || "Registrant")}</p>
              <h3>${escapeHtml(fullName)}</h3>
            </div>
            <span class="lsts-time">${escapeHtml(submittedAt)}</span>
          </div>
          <div class="lsts-tags">
            <span>${escapeHtml(department)}</span>
            <span>${escapeHtml(person.gender || "Gender not provided")}</span>
            <span class="${person.student === "Yes" ? "is-student" : ""}">${person.student === "Yes" ? "Student" : "Non-student"}</span>
          </div>
          <dl class="lsts-detail-list">
            <div><dt>Phone</dt><dd><a href="tel:${escapeHtml(person.phoneNumber)}">${escapeHtml(person.phoneNumber || "Not provided")}</a></dd></div>
            <div><dt>Email</dt><dd><a href="mailto:${escapeHtml(person.email)}">${escapeHtml(person.email || "Not provided")}</a></dd></div>
            <div class="lsts-detail-wide"><dt>Address</dt><dd>${escapeHtml(person.residentialAddress || "Not provided")}</dd></div>
            ${person.student === "Yes" ? `
              <div><dt>School department</dt><dd>${escapeHtml(person.departmentInSchool || "Not provided")}</dd></div>
              <div><dt>Level</dt><dd>${escapeHtml(person.level ? `${person.level} Level` : "Not provided")}</dd></div>
            ` : ""}
          </dl>
        `;
        container.appendChild(card);
      });
    }

    lstsSearch.addEventListener("input", () => {
      const query = lstsSearch.value.trim().toLowerCase();
      const filtered = !query
        ? weeklyLstsData
        : weeklyLstsData.filter((person) => [
            person.surname,
            person.otherNames,
            person.email,
            person.phoneNumber,
            Array.isArray(person.departmentInChurch)
              ? person.departmentInChurch.join(" ")
              : person.departmentInChurch
          ].join(" ").toLowerCase().includes(query));

      renderLSTSList(filtered, lstsContainer, "No weekly registration matches your search.");
    });


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
