import { renderHeader, wireLogout, PreventBackButton } from "./utils.js";
renderHeader();
wireLogout();
PreventBackButton();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("membershipForm");
  const submitBtn = form.querySelector(".submit-button");
  const studentStatusField = form.querySelector("#studentStatus");
  const schoolFieldsWrapper = document.querySelector("#schoolDetails");
  const animationContainer = document.getElementById("animation-container");

  studentStatusField.addEventListener("change", () => {
    schoolFieldsWrapper.style.display = studentStatusField.value === "Yes" ? "block" : "none";
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
        Level: form.querySelector("#level").value
      }),
//       
      SubmittedAt: new Date().toISOString().split(".")[0]
    };
    
    console.log("Submitting payload:", payload);

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
  
    try {
      const res = await fetch(
        "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/LSTSFORM",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)  // wrap in `dto`
        }
      );
  
      const data = await res.json().catch(() => ({}));
      console.log("API response:", data);
      if (res.ok) {
        showAnimation("success", data.message || "Form submitted successfully.", payload);
        form.reset();
        schoolFieldsWrapper.style.display = "none";
      } else {
        console.error("API response:", data);
        showAnimation("error", data.message || "Submission failed.");
      }
  
    } catch (err) {
      console.error("LSTS form error:", err);
      showAnimation("Network error—please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  });

  function showAnimation(status, message, formData = null) {
    animationContainer.innerHTML = `
      <div class="overlay">
        <img src="/Divine-Grace-Upgrade/images/${status === "success" ? "checkmark" : "error-mark"}.png" class="status-icon" />
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
      document.getElementById("download-btn").onclick = () => generateReceipt(formData);
    }
  }

  function generateReceipt(data) {
    const receiptElement = document.getElementById("receipt");
  
    // Fill in receipt fields
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
  
    // Show the receipt temporarily for rendering
    receiptElement.style.display = "block";
  
    const downloadMessage = document.createElement("div");
    downloadMessage.textContent = "Your receipt is being downloaded...";
    downloadMessage.style.cssText = `
      position: fixed;
      bottom: 170px;
      left: 50%;
      transform: translateX(-50%);
      background: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      z-index: 9999;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(downloadMessage);
  
    // Remove message after 4 seconds
    setTimeout(() => {
      downloadMessage.remove();
    }, 4000);
  

    // Define PDF options
    const pdfOptions = {
      margin: [10, 10, 10, 10], // top, left, bottom, right in mm
      filename: "LSTS_Receipt.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0
      },
      jsPDF: {
        unit: "mm",
        format: [140, 216], // Custom format close to half-letter size (better for short receipts)
        orientation: "portrait"
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
  
    html2pdf()
      .from(receiptElement)
      .set(pdfOptions)
      .save()
      .then(() => {
        // Hide again after generation
        receiptElement.style.display = "none";
      })
      .catch((err) => {
        console.error("PDF generation failed:", err);
        receiptElement.style.display = "none";
      });
  }
  
  
  
});
