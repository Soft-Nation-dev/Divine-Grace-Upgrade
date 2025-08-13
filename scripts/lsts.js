import {
  renderHeader,
  wireLogout,
  PreventBackButton,
  checkSession,
  loadProfilePicture,
  addReceiptBackground,
  returnHome,
  preventBackCacheReload,
  authHeaders
} from "./utils.js";

renderHeader();
checkSession();
preventBackCacheReload();
returnHome();
wireLogout();
PreventBackButton();
loadProfilePicture();

const now = new Date();
const today = now.getDay();
const hours = now.getHours();
const minutes = now.getMinutes();

const isAfterFridayNoon =
  (today === 5 && (hours > 12 || (hours === 12 && minutes >= 0))) || today > 5;

if (isAfterFridayNoon) {
  document.querySelector(".main-content").innerHTML = `
    <div style="text-align: center; padding: 40px; margin-top: 100px;">
      <h2 style="font-size: 2rem; color: #b71c1c;">LSTS Registration is currently closed.</h2>
      <p style="font-size: 1.2rem;">Please check back later. Registration is open until Friday 12:00 PM each week.</p>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("membershipForm");
  const submitBtn = form.querySelector(".submit-button");
  const studentStatusField = form.querySelector("#studentStatus");
  const schoolFieldsWrapper = document.querySelector("#schoolDetails");
  const animationContainer = document.getElementById("animation-container");

  studentStatusField.addEventListener("change", () => {
    schoolFieldsWrapper.style.display =
      studentStatusField.value === "Yes" ? "block" : "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      Surname: form.querySelector("#register-firstname").value.trim(),
      OtherNames: form.querySelector("#otherNames").value.trim(),
      PhoneNumber: form.querySelector("#phoneNumber").value.trim(),
      Email: form.querySelector("#email").value.trim(),
      ResidentialAddress: form.querySelector("#residentialAddress").value.trim(),
      DepartmentInChurch: form.querySelector("#department").value,
      PositionInChurch: form.querySelector("#position").value,
      Gender: form.querySelector("#gender").value,
      Student: studentStatusField.value || "",
      ...(studentStatusField.value === "Yes" && {
        DepartmentInSchool: form.querySelector("#schoolDepartment").value.trim(),
        Level: form.querySelector("#level").value,
      }),
      SubmittedAt: new Date().toISOString().split(".")[0],
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    try {
      const res = await fetch(
        "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/LSTSFORM",
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        showAnimation("success", data.message || "Form submitted successfully.", payload);
        form.reset();
        schoolFieldsWrapper.style.display = "none";
      } else {
        showAnimation("error", data.message || "Submission failed.");
      }
    } catch (err) {
      showAnimation("error", "Network error—please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  });

  function showAnimation(status, message, formData = null) {
    animationContainer.innerHTML = `
      <div class="overlay">
        <img src="../images/${status === "success" ? "checkmark" : "error-mark"}.png" class="status-icon" />
        <h2>${message}</h2>
        ${status === "success" ? `<button id="download-btn">Download Receipt</button>` : ""}
        <button id="close-btn">Close</button>
      </div>
    `;
    animationContainer.style.display = "flex";

    document.getElementById("close-btn").onclick = () => {
      animationContainer.style.display = "none";
    };

    if (status === "success" && formData) {
      document.getElementById("download-btn").onclick = () =>
        generateReceipt(formData);
    }
  }

  function generateReceipt(data) {
    const receiptElement = document.getElementById("receipt");

    document.getElementById("r-name").textContent = `${data.Surname} ${data.OtherNames}`;
    document.getElementById("r-phone").textContent = data.PhoneNumber;
    document.getElementById("r-email").textContent = data.Email;
    document.getElementById("r-address").textContent = data.ResidentialAddress;
    document.getElementById("r-gender").textContent = data.Gender;
    document.getElementById("r-dept").textContent = data.DepartmentInChurch;
    document.getElementById("r-pos").textContent = data.PositionInChurch;
    document.getElementById("r-date").textContent = data.SubmittedAt;

    if (data.Student === "Yes") {
      document.getElementById("student-info").style.display = "block";
      document.getElementById("r-school-dept").textContent = data.DepartmentInSchool;
      document.getElementById("r-level").textContent = data.Level;
    } else {
      document.getElementById("student-info").style.display = "none";
    }

    receiptElement.style.display = "block";
    receiptElement.style.visibility = "visible";
    receiptElement.scrollIntoView();

    const spinner = document.createElement("div");
    spinner.textContent = "Generating your receipt...";
    spinner.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 10px;
      z-index: 9999;
    `;
    document.body.appendChild(spinner);

    addReceiptBackground();

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const safeName = `${data.Surname}_${data.OtherNames}`
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "_");
    const fileName = `LSTS_Receipt_${safeName}_${timestamp}.pdf`;

    setTimeout(() => {
      html2pdf()
        .from(receiptElement)
        .set({
          margin: [10, 10, 10, 10],
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            allowTaint: false,
            scrollY: 0,
          },
          jsPDF: {
            unit: "mm",
            format: [140, 216],
            orientation: "portrait",
          },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .save()
        .then(() => {
          receiptElement.style.display = "none";
          spinner.remove();
        })
        .catch((err) => {
          receiptElement.style.display = "none";
          spinner.remove();
          alert("There was a problem generating your receipt.");
        });
    }, 100);
  }
});
