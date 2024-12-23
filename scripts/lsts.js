import { renderHeader } from "./homepage.js";

renderHeader();



document.getElementById('membershipForm').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const formData = {
        surname: document.getElementById('surname').value,
        otherNames: document.getElementById('otherNames').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        email: document.getElementById('email').value,
        residentialAddress: document.getElementById('residentialAddress').value,
        department: document.getElementById('department').value,
        position: document.getElementById('position').value,
    };

    console.log('Form Data:', formData);
            alert('Registration successfull!');
        });