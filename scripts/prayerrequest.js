import {
  renderHeader,
  wireLogout,
  PreventBackButton,
  checkSession,
  loadProfilePicture,
  returnHome,
  preventBackCacheReload,
  authHeaders 
} from "./utils.js";

renderHeader();
wireLogout();
checkSession();
preventBackCacheReload();
returnHome();
PreventBackButton();
loadProfilePicture();

document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('.submit-button');
  const textarea = document.querySelector('.big-textarea');

  const overlay = document.getElementById('success-overlay');
  if (overlay) {
    overlay.classList.add('hiddenn');
    const spinner = overlay.querySelector('.success-spinner');
    const checkmark = overlay.querySelector('.success-checkmark');
    spinner?.classList.add('hiddenn');
    checkmark?.classList.add('hiddenn');
  }

  submitButton.addEventListener('click', async () => {
    const message = textarea.value.trim();
    if (!message) {
      alert('Please enter your prayer request.');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    const prayerRequestData = {
      PrayerRequest: message,
      SubmittedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(
        'https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/PrayerRequest/PrayerRequests',
        {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }), // ✅ Use helper
          credentials: 'include',
          body: JSON.stringify(prayerRequestData)
        }
      );

      let data = {};
      try {
        data = await response.json();
      } catch {
        console.warn('No JSON returned from backend.');
      }

      if (response.ok) {
        const overlay = document.getElementById('success-overlay');
        const spinner = overlay.querySelector('.success-spinner');
        const checkmark = overlay.querySelector('.success-checkmark');

        overlay.classList.remove('hiddenn');
        spinner.classList.remove('hiddenn');
        checkmark.classList.add('hiddenn');

        setTimeout(() => {
          spinner.classList.add('hiddenn');
          checkmark.classList.remove('hiddenn');
        }, 1000);

        setTimeout(() => {
          window.location.replace('../prayerequest');
        }, 3000);
      } else {
        alert(data.message || 'Failed to submit.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Submission failed. Please try again.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'SUBMIT';
    }
  });
});
