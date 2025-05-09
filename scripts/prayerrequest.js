import { renderHeader } from "./utils.js";
import { wireLogout } from "./utils.js";

renderHeader();
wireLogout();

document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('.submit-button');
  const textarea     = document.querySelector('.big-textarea');

  submitButton.addEventListener('click', async () => {
    const message = textarea.value.trim();
    if (!message) {
      alert('Please enter your prayer request.');
      return;
    }

    submitButton.disabled   = true;
    submitButton.textContent = 'Submitting...';

    const prayerRequestData = {
      PrayerRequest: message,
      SubmittedAt:   new Date().toISOString()
    };

    try {
      const response = await fetch(
        'https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/PrayerRequests',
        {
          method:      'POST',
          headers:     { 'Content-Type': 'application/json' },
          credentials: 'include',
          body:        JSON.stringify(prayerRequestData)
        }
      );

      let data = {};
      try {
        data = await response.json();
      } catch {
        console.warn('No JSON returned from backend.');
      }
      if (response.ok) {
        const overlay      = document.getElementById('success-overlay');
        const spinner      = overlay.querySelector('.success-spinner');
        const checkmark    = overlay.querySelector('.success-checkmark');
      
        overlay.classList.remove('hiddenn');
        spinner.classList.remove('hiddenn');
        checkmark.classList.add('hiddenn');
      
        setTimeout(() => {
          spinner.classList.add('hiddenn');
          checkmark.classList.remove('hiddenn');
        }, 1000);
      
        setTimeout(() => {
          window.location.replace('/Divine-Grace-Upgrade/prayerequest')
        }, 3000);
      
      } else {
        alert(data.message || 'Failed to submit.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Submission failed. Please try again.');
    } finally {
      submitButton.disabled   = false;
      submitButton.textContent = 'SUBMIT';
    }
  });
});
