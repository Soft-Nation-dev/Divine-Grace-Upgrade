/**
 * API Configuration for Divine Grace Upgrade
 * Include this script before page scripts that call the backend.
 */

const LOCAL_BACKEND_URL = 'http://127.0.0.1:8787';
const PRODUCTION_BACKEND_URL = 'https://divine-grace-upgrade-api-production.ojam.workers.dev';

const isLocalPage = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const overrideUrl = window.localStorage.getItem('backendUrlOverride');

window._backendUrl = overrideUrl || (isLocalPage ? LOCAL_BACKEND_URL : PRODUCTION_BACKEND_URL);

console.log('API Backend URL configured:', window._backendUrl);
