/**
 * API Configuration for Divine Grace Upgrade
 * Include this script before page scripts that call the backend.
 */

const LOCAL_BACKEND_URL = 'http://127.0.0.1:8787';
const PRODUCTION_BACKEND_URL = 'https://divine-grace-upgrade-api-production.ojam.workers.dev';

const params = new URLSearchParams(window.location.search);
const overrideUrl = window.localStorage.getItem('backendUrlOverride')?.trim();
const localBackendRequested = params.get('backend') === 'local';

window._backendUrl = (overrideUrl || (localBackendRequested ? LOCAL_BACKEND_URL : PRODUCTION_BACKEND_URL))
  .replace(/\/$/, '');

console.log('API Backend URL configured:', window._backendUrl);
