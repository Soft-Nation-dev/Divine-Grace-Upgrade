export async function loadUserData() {
  try {
    const token = sessionStorage.getItem("authToken"); // ✅ Fix: retrieve the token

    if (!token) {
      console.warn("No token found in sessionStorage");
      return;
    }

    const res = await fetch(
      'https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/profile',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const user = await res.json();

    document.getElementById('user-name').textContent                = `${user.firstName} ${user.otherNames}`;
    document.getElementById('user-department').textContent          = user.departmentInChurch   || '—';
    document.getElementById('user-phone').textContent               = user.phoneNumber  || '—';
    document.getElementById('user-email').textContent               = user.email;
    document.getElementById('user-address').textContent             = user.residentialAddress     || '—';
    document.getElementById('user-school-department').textContent   = user.departmentInSchool || '—';
    document.getElementById('user-firstname').textContent           = user.userName || '—';
    document.getElementById('welcome-message').textContent          = `Welcome back, ${user.userName}`;
    
  } catch (err) {
    console.error("Network or unexpected error:", err);
  }
}
