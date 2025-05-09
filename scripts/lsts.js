// /scripts/lsts.js
import { renderHeader } from "./utils.js";
import { wireLogout }    from "./utils.js";

renderHeader();
wireLogout();

document.addEventListener("DOMContentLoaded", () => {
  const form      = document.getElementById("membershipForm");
  const submitBtn = form.querySelector(".submit-button");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();


    const payload = {
      Surname:            form.querySelector("#register-firstname").value.trim(),
      OtherNames:         form.querySelector("#otherNames").value.trim(),
      PhoneNumber:        form.querySelector("#phoneNumber").value.trim(),
      Email:               form.querySelector("#email").value.trim(),
      ResidentialAddress: form.querySelector("#residentialAddress").value.trim(),
      DepartmentInChurch: form.querySelector("#department").value,
      PositionInChurch:   form.querySelector("#position").value,
      SubmittedAt:        new Date().toISOString()
    };

    if (Object.values(payload).some(v => !v)) {
      return alert("Please fill out every field.");
    }

    submitBtn.disabled   = true;
    submitBtn.textContent = "Submitting…";

    try {
      const res = await fetch(
        "https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/LSTSFORM",
        {
          method:      "POST",
          credentials: "include",                 
          headers:     { "Content-Type": "application/json" },
          body:        JSON.stringify(payload)
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert(data.message || "Form submitted successfully.");
        form.reset();
      } else {
        alert(data.message || "Submission failed.");
      }

    } catch (err) {
      console.error("LSTS form error:", err);
      alert("Network error—please try again.");
    } finally {
      submitBtn.disabled   = false;
      submitBtn.textContent = "Submit";
    }
  });
});
