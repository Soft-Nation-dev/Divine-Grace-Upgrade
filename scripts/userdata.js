export async function loadUserData() {
  try {
    const token = sessionStorage.getItem("authToken");

    if (!token) {
      console.warn("No token found in sessionStorage");
      return;
    }

    const backendBaseUrl = window._backendUrl || 'http://127.0.0.1:8787';
    const res = await fetch(`${backendBaseUrl}/api/auth/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.warn('Failed to load profile:', res.status);
      return;
    }

    const response = await res.json();
    const user = response?.user || response;
    const firstName = user.firstName || user.first_name || '';
    const otherNames = user.otherNames || user.other_names || '';
    const fullName = `${firstName} ${otherNames}`.trim() || user.email || 'User';

    document.getElementById('user-name').textContent = fullName;
    document.getElementById('user-department').textContent = user.departmentInChurch || user.department_in_church || '—';
    document.getElementById('user-phone').textContent = user.phoneNumber || user.phone_number || '—';
    document.getElementById('user-email').textContent = user.email || '—';
    document.getElementById('user-address').textContent = user.residentialAddress || user.residential_address || '—';
    document.getElementById('user-school-department').textContent = user.departmentInSchool || user.department_in_school || '—';
    document.getElementById('welcome-message').textContent = `Welcome back, ${otherNames || firstName || 'User'}`;
    
  } catch (err) {
    console.error("Network or unexpected error:", err);
  }
}
