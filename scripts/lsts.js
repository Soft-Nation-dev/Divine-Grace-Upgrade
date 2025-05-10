// /scripts/lsts.js
import { renderHeader, wireLogout, PreventBackButton } from "./utils.js";

renderHeader();
wireLogout();
PreventBackButton();

const studentStatus = document.getElementById("studentStatus");
const schoolDetails = document.getElementById("schoolDetails");

studentStatus.addEventListener("change", () => {
  if (studentStatus.value === "Yes") {
    schoolDetails.style.display = "block";
    document.getElementById("schoolDepartment").required = true;
    document.getElementById("level").required = true;
  } else {
    schoolDetails.style.display = "none";
    document.getElementById("schoolDepartment").required = false;
    document.getElementById("level").required = false;
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("membershipForm");
  const submitBtn = form.querySelector(".submit-button");

  const studentStatusField = form.querySelector("#studentStatus");
  const schoolFieldsWrapper = document.querySelector("#schoolDetails");

  // Toggle school fields visibility
  studentStatusField.addEventListener("change", () => {
    if (studentStatusField.value === "Yes") {
      schoolFieldsWrapper.style.display = "block";
    } else {
      schoolFieldsWrapper.style.display = "none";
    }
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
      IsStudent: studentStatusField.value,
      DepartmentInSchool: studentStatusField.value === "Yes"
        ? form.querySelector("#schoolDepartment").value.trim()
        : null,
      Level: studentStatusField.value === "Yes"
        ? form.querySelector("#level").value
        : null,
      SubmittedAt: new Date().toISOString()
    };

    if (Object.values(payload).some(v => v === "" || v === null)) {
      return alert("Please fill out every required field.");
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    try {
      const res = await fetch(
        "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/LSTSFORM",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert(data.message || "Form submitted successfully.");
        form.reset();
        schoolFieldsWrapper.style.display = "none"; // hide conditional fields after reset
      } else {
        alert(data.message || "Submission failed.");
      }

    } catch (err) {
      console.error("LSTS form error:", err);
      alert("Network error—please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  });
});
