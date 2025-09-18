export async function loadUserData() {
  try {
    const token = sessionStorage.getItem("authToken");

    if (!token) {
      console.warn("No token found in sessionStorage");
      return;
    }

    const res = await fetch(
      'https://dgunec-gddwdkd0hbe9dxe2.southafricanorth-01.azurewebsites.net/api/Profile/profile',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const user = await res.json();
    console.log("Fetched user data:", user);

    document.getElementById('user-name').textContent                = `${user.firstName} ${user.otherNames}`;
    document.getElementById('user-department').textContent          = user.departmentInChurch   || '—';
    document.getElementById('user-phone').textContent               = user.phoneNumber  || '—';
    document.getElementById('user-email').textContent               = user.email;
    document.getElementById('user-address').textContent             = user.residentialAddress     || '—';
    document.getElementById('user-school-department').textContent   = user.departmentInSchool || '—';
    // document.getElementById('user-firstname').textContent           = user.username || '—';
    document.getElementById('welcome-message').textContent          = `Welcome back, ${user.otherNames}`;
    
  } catch (err) {
    console.error("Network or unexpected error:", err);
  }
}
