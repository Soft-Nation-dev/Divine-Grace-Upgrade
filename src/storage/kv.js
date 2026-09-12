// =============================================
// Cloudflare Worker - KV Storage Utilities
// =============================================

export const saveLstsRegistration = async (kv, registration) => {
  const id = registration.id;
  const weekKey = getWeekKey(registration.submitted_at);

  // Store individual registration
  await kv.put(`lsts:${id}`, JSON.stringify(registration), { expirationTtl: 31536000 });

  // Add to week index
  await addToWeekIndex(kv, 'lsts', weekKey, id);

  // Add to user index
  const userKey = `lsts:user:${registration.user_id}`;
  await addToUserIndex(kv, userKey, id);
};

export const getLstsRegistration = async (kv, id) => {
  const data = await kv.get(`lsts:${id}`);
  return data ? JSON.parse(data) : null;
};

export const getUserLstsRegistrations = async (kv, userId) => {
  const data = await kv.get(`lsts:user:${userId}`);
  if (!data) return [];

  const ids = JSON.parse(data);
  const registrations = [];

  for (const id of ids) {
    const reg = await getLstsRegistration(kv, id);
    if (reg) registrations.push(reg);
  }

  return registrations.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
};

export const getWeeklyLstsRegistrations = async (kv) => {
  const weekKey = getWeekKey(new Date().toISOString());
  return getRegistrationsByWeek(kv, 'lsts', weekKey);
};

export const getAllLstsRegistrations = async (kv) => {
  const data = await kv.list({ prefix: 'lsts:' });
  const registrations = [];

  for (const item of data.keys) {
    if (item.name.startsWith('lsts:') && !item.name.includes(':user:') && !item.name.includes(':week:')) {
      const reg = await kv.get(item.name);
      if (reg) registrations.push(JSON.parse(reg));
    }
  }

  return registrations.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
};

// Prayer functions
export const savePrayerRequest = async (kv, prayer) => {
  const id = prayer.id;
  await kv.put(`prayer:${id}`, JSON.stringify(prayer), { expirationTtl: 31536000 });
  await addToGlobalIndex(kv, 'prayers', id);
};

export const getPrayerRequest = async (kv, id) => {
  const data = await kv.get(`prayer:${id}`);
  return data ? JSON.parse(data) : null;
};

export const getAllPrayers = async (kv) => {
  const data = await kv.get('index:prayers');
  if (!data) return [];

  const ids = JSON.parse(data);
  const prayers = [];

  for (const id of ids) {
    const prayer = await getPrayerRequest(kv, id);
    if (prayer) prayers.push(prayer);
  }

  return prayers.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
};

// Summit functions
export const saveSummitRegistration = async (kv, registration) => {
  const id = registration.id;
  await kv.put(`summit:${id}`, JSON.stringify(registration), { expirationTtl: 31536000 });

  const userKey = `summit:user:${registration.user_id}`;
  await addToUserIndex(kv, userKey, id);
};

export const getSummitRegistration = async (kv, id) => {
  const data = await kv.get(`summit:${id}`);
  return data ? JSON.parse(data) : null;
};

export const getUserSummitRegistrations = async (kv, userId) => {
  const data = await kv.get(`summit:user:${userId}`);
  if (!data) return [];

  const ids = JSON.parse(data);
  const registrations = [];

  for (const id of ids) {
    const reg = await getSummitRegistration(kv, id);
    if (reg) registrations.push(reg);
  }

  return registrations.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
};

export const getAllSummitRegistrations = async (kv) => {
  const data = await kv.list({ prefix: 'summit:' });
  const registrations = [];

  for (const item of data.keys) {
    if (item.name.startsWith('summit:') && !item.name.includes(':user:')) {
      const reg = await kv.get(item.name);
      if (reg) registrations.push(JSON.parse(reg));
    }
  }

  return registrations.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
};

// =============================================
// Helper Functions
// =============================================

export const getWeekKey = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const week = Math.ceil(date.getDate() / 7);
  return `${year}-${month}-w${week}`;
};

export const getWeekRange = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;

  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  return { monday, friday };
};

const addToWeekIndex = async (kv, type, weekKey, id) => {
  const indexKey = `index:${type}:${weekKey}`;
  const data = await kv.get(indexKey);
  const ids = data ? JSON.parse(data) : [];

  if (!ids.includes(id)) {
    ids.push(id);
    await kv.put(indexKey, JSON.stringify(ids));
  }
};

const addToUserIndex = async (kv, userKey, id) => {
  const data = await kv.get(userKey);
  const ids = data ? JSON.parse(data) : [];

  if (!ids.includes(id)) {
    ids.push(id);
    await kv.put(userKey, JSON.stringify(ids));
  }
};

const addToGlobalIndex = async (kv, type, id) => {
  const indexKey = `index:${type}`;
  const data = await kv.get(indexKey);
  const ids = data ? JSON.parse(data) : [];

  if (!ids.includes(id)) {
    ids.push(id);
    await kv.put(indexKey, JSON.stringify(ids));
  }
};

const getRegistrationsByWeek = async (kv, type, weekKey) => {
  const indexKey = `index:${type}:${weekKey}`;
  const data = await kv.get(indexKey);
  if (!data) return [];

  const ids = JSON.parse(data);
  const registrations = [];

  for (const id of ids) {
    const reg = await kv.get(`${type}:${id}`);
    if (reg) registrations.push(JSON.parse(reg));
  }

  return registrations.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
};
