export async function loadUserData() {
  try {
    const res = await fetch(
      'https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/auth/profile',
      { method: 'GET', credentials: 'include' }
    );

    console.log("Profile response status:", res.status);

    if (res.status === 401 || res.status === 403) {
      console.warn("Not authenticated, redirecting...");
      window.location.replace('../registerlogin');
      return;
    }

    const user = await res.json();

    // Fill in UI
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
    // Optionally show an error on the UI instead of redirecting
  }
}
