

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
    buttonEl.classList.remove('loading');
    spinner.classList.add('spinner--hidden');
    text.style.display = '';
  }
}

export function toggleVisibility(hide, show) {
  hide.forEach(div => div.classList.replace('visible', 'hidden'));
  show.forEach(div => div.classList.replace('hidden', 'visible'));
}

export function renderHeader() {
  const hamburgerButton = document.querySelector('.js-hambuger-button');
  const exitNavButton = document.querySelector('.js-exit-butt');
  const navMenu = document.querySelector('.nav-menu');
  const mainContent = document.querySelector('.main-content');

  if (!hamburgerButton || !navMenu) return;

  hamburgerButton.addEventListener('click', () => {
    navMenu.classList.toggle('visible');
    mainContent.classList.toggle('blurred', navMenu.classList.contains('visible'));
  });

  if (exitNavButton) {
    exitNavButton.addEventListener('click', () => {
      navMenu.classList.remove('visible');
      mainContent.classList.remove('blurred');
    });
  }
}

export function wireLogout() {
  const signOutButton = document.querySelector('.js-sign-out-button');
  if (!signOutButton) return;

  signOutButton.addEventListener('click', async () => {
    try {
      await fetch('https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      sessionStorage.removeItem("popupDismissed");
      window.location.href = '../registerlogin';
    } catch {
      alert('Logout error—please try again.');
    }
  });
}

export function returnHome() {
  const homeButton = document.querySelector(".home-button");

  homeButton.addEventListener("click", async () => {
    try {
      await fetch('https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      sessionStorage.removeItem("popupDismissed");
      window.location.href = '../index.html';
    } catch {
      alert('Logout error—please try again.');
    }
  });
}

export function PreventBackButton() {
  window.history.pushState({}, "", location.href);
  window.onpopstate = () => {
    window.location.href = "../home";
  };
}

export function makeAdmin() {
  document.getElementById("assign-admin-btn").addEventListener("click", () => {
    const email = prompt("Enter email to assign admin rights:");
    if (!email) return;

    fetch("https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/assign-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email })
    })
      .then(response => {
        if (response.status === 401 || response.redirected) {
          alert("You are not authorized. Please log in first.");
          window.location.href = "/login.html";
          return;
        }
        if (response.ok) {
          alert("Admin privileges granted successfully.");
        } else {
          response.text().then(text => alert("Failed to assign admin: " + text));
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert("An error occurred while assigning admin.");
      });
  });
}

export function redirect() {
  fetch('/api/secure-data', { credentials: 'include' })
    .then(res => {
      if (!res.ok) {
        console.warn(`Secure check failed. Status: ${res.status}`);
        if (res.status === 405) {
          sessionStorage.removeItem("popupDismissed");
          window.location.href = "../registerlogin";
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => console.log("Secure data response:", data))
    .catch(err => console.error("Redirect error:", err.message));
}

export async function checkSession(redirectUrl = '../registerlogin', delay = 1000) {
  try {
    const res = await fetch('https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/check', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.isAuthenticated) {
      sessionStorage.removeItem("popupDismissed");
      window.location.href = redirectUrl;
    }
  } catch (err) {
    console.error('Session check failed:', err);
    window.location.href = redirectUrl;
  }
}

export function loadProfilePicture() {
  const uploadButton = document.getElementById('upload-profile-button');
  const fileInput = document.getElementById('profile-picture-input');
  const uploadMessage = document.getElementById('upload-message');
  const userProfileImage = document.getElementById('user-profile-image');
  const userProfileImage1 = document.getElementById('profile-image');
  const fileNameSpan = document.getElementById('selected-file-name');
  const backendBaseUrl = 'https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net';
  const defaultProfilePic = '../images/th-2238308759';
  let messageTimeoutId = null;

  function updateProfileImage(imageUrl) {
    const fullUrl = imageUrl + '?t=' + new Date().getTime();
    if (userProfileImage) userProfileImage.src = fullUrl;
    if (userProfileImage1) userProfileImage1.src = fullUrl;
  }

  async function fetchProfilePicture() {
    try {
      const res = await fetch(`${backendBaseUrl}/api/users/profile-picture`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) return updateProfileImage(data.imageUrl);
      }
      if (userProfileImage) userProfileImage.src = defaultProfilePic;
      if (userProfileImage1) userProfileImage1.src = defaultProfilePic;
    } catch (err) {
      console.error('Error fetching profile picture:', err);
      if (userProfileImage) userProfileImage.src = defaultProfilePic;
      if (userProfileImage1) userProfileImage1.src = defaultProfilePic;
    }
  }

  fetchProfilePicture();

  if (fileInput && uploadButton && uploadMessage && fileNameSpan) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        uploadButton.style.display = 'inline-block';
        fileNameSpan.textContent = fileInput.files[0].name;
      } else {
        uploadButton.style.display = 'none';
        fileNameSpan.textContent = '';
      }
      hideUploadMessage();
    });

    function showUploadMessage(msg, isError = true) {
      uploadMessage.style.color = isError ? 'red' : 'green';
      uploadMessage.textContent = msg;
      uploadMessage.style.display = 'block';
      clearTimeout(messageTimeoutId);
      messageTimeoutId = setTimeout(hideUploadMessage, 4000);
    }

    function hideUploadMessage() {
      uploadMessage.textContent = '';
      uploadMessage.style.display = 'none';
      clearTimeout(messageTimeoutId);
      messageTimeoutId = null;
    }

    function setButtonLoading(button, isLoading) {
      button.disabled = isLoading;
      button.textContent = isLoading ? 'Uploading...' : 'Upload Profile Picture';
      button.style.opacity = isLoading ? '0.6' : '1';
      button.style.cursor = isLoading ? 'not-allowed' : 'pointer';
    }

    uploadButton.addEventListener('click', async () => {
      hideUploadMessage();
      if (!fileInput.files || fileInput.files.length === 0) return showUploadMessage('Please select a file to upload.');

      const file = fileInput.files[0];
      if (!file.type.startsWith('image/')) return showUploadMessage('Please select a valid image file.');

      setButtonLoading(uploadButton, true);
      const formData = new FormData();
      formData.append('profilePicture', file);

      try {
        const res = await fetch(`${backendBaseUrl}/api/users/upload-profile-picture`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          showUploadMessage('Profile picture uploaded successfully!', false);
          if (data.imageUrl) updateProfileImage(data.imageUrl);
          fileInput.value = '';
          uploadButton.style.display = 'none';
          fileNameSpan.textContent = '';
        } else if (res.status === 401) {
          showUploadMessage('Unauthorized. Please log in again.');
        } else {
          const errorData = await res.json();
          showUploadMessage(errorData.message || 'Upload failed.');
        }
      } catch (err) {
        console.error('Upload error:', err);
        showUploadMessage('Upload failed. Please try again.');
      } finally {
        setButtonLoading(uploadButton, false);
      }
    });
  }
}

export function addReceiptBackground() {
  const receipt = document.getElementById("receipt");
  const existingBg = document.querySelector(".receipt-bg");
  if (existingBg) existingBg.remove();

  const bgImg = document.createElement("img");
  bgImg.src = "../images/mlogo.png";
  bgImg.className = "receipt-bg";

  Object.assign(bgImg.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    opacity: "0.1",
    objectFit: "contain",
    zIndex: "0",
    pointerEvents: "none",
  });

  receipt.style.position = "relative";
  receipt.insertBefore(bgImg, receipt.firstChild);
}

export function preventBackCacheReload() {
  window.addEventListener('pageshow', function (event) {
    const navigationEntries = performance.getEntriesByType("navigation");
    const navType = navigationEntries.length > 0 ? navigationEntries[0].type : null;

    if (event.persisted || navType === 'back_forward') {
      window.location.reload();
    }
  });
}

export function showPopup() {
  const popup = document.getElementById("popup-invite");
  const closeButton = document.getElementById("closePopUp");

  if (popup && !sessionStorage.getItem("popupDismissed")) {
    popup.style.display = "flex";
    sessionStorage.setItem("popupDismissed", "true");

    if (closeButton) {
      closeButton.addEventListener("click", closePopup, { once: true });
    }
  }
}

export function closePopup() {
  const popup = document.getElementById("popup-invite");
  const closeButton = document.getElementById("closePopUp");

  if (popup) {
    if (closeButton) {
      closeButton.disabled = true;
      closeButton.textContent = "Closing...";
      closeButton.style.cursor = "not-allowed";
      closeButton.style.opacity = "0.6";
    }

    popup.classList.add("fade-out");
    popup.addEventListener("animationend", () => {
      popup.style.display = "none";
      popup.classList.remove("fade-out");
    }, { once: true });

    sessionStorage.setItem("popupDismissed", "true");
  }
}
