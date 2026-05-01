const BASE_URL = "https://leafscan-project-4wny.onrender.com";

export function getToken()  { return localStorage.getItem('pd_token'); }
function setToken(token)    { localStorage.setItem('pd_token', token); }
export function clearToken(){ localStorage.removeItem('pd_token'); }

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res  = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function apiRegister({ name, email, password }) {
  const data = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
  setToken(data.token);
  return data.user;
}

export async function apiLogin({ email, password }) {
  const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  setToken(data.token);
  return data.user;
}

export function apiLogout() { clearToken(); }

export async function apiGetMe() {
  const data = await request('/auth/me');
  return data.user;
}

// Sends image to Express backend → which calls Flask YOLO model automatically
export async function apiSaveScan({ plantName, notes, imgSrc }) {
  const data = await request('/scans', {
    method: 'POST',
    body: JSON.stringify({ plantName, notes, imageData: imgSrc }),
  });
  return data.scan;
}

export async function apiGetScans(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();
  return request(`/scans${qs ? '?' + qs : ''}`);
}

export async function apiDeleteScan(id) { return request(`/scans/${id}`, { method: 'DELETE' }); }
export async function apiClearScans()   { return request('/scans', { method: 'DELETE' }); }

export function normaliseScan(scan) {
  return {
    id:          scan._id,
    userId:      scan.userId,
    userName:    scan.userName,
    plantName:   scan.plantName,
    notes:       scan.notes,
    imgSrc:      scan.imageData || (scan.imageUrl ? `http://localhost:5000${scan.imageUrl}` : null),
    submittedAt: scan.createdAt,
    label:       scan.label,
    isHealthy:   scan.isHealthy,
    confidence:  scan.confidence,
    displayName: scan.displayName,
    severity:    scan.severity,
    description: scan.description,
    treatment:   scan.treatment,
  };
}
