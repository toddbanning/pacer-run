const CLIENT_ID = process.env.REACT_APP_STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_STRAVA_CLIENT_SECRET;
const REDIRECT_URI = process.env.REACT_APP_STRAVA_REDIRECT_URI;
const TOKEN_KEY = 'pacer_strava_tokens';

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  });
  return `https://www.strava.com/oauth/authorize?${params}`;
}

export function saveTokens(tokens) { localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens)); }
export function getTokens() {
  try { return JSON.parse(localStorage.getItem(TOKEN_KEY)); } catch { return null; }
}
export function clearTokens() { localStorage.removeItem(TOKEN_KEY); }

export async function exchangeCodeForTokens(code) {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, grant_type: 'authorization_code' }),
  });
  if (!res.ok) throw new Error('Token exchange failed');
  return res.json();
}

export async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: refreshToken, grant_type: 'refresh_token' }),
  });
  if (!res.ok) throw new Error('Token refresh failed');
  const data = await res.json();
  saveTokens(data);
  return data;
}

export async function getValidAccessToken() {
  let tokens = getTokens();
  if (!tokens) return null;
  const now = Math.floor(Date.now() / 1000);
  if (tokens.expires_at < now + 60) tokens = await refreshAccessToken(tokens.refresh_token);
  return tokens.access_token;
}

export async function fetchActivities({ after, perPage = 100, page = 1 } = {}) {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');
  const params = new URLSearchParams({ per_page: perPage, page });
  if (after) params.set('after', after);
  const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch activities');
  return res.json();
}

export async function fetchAllActivitiesSince(daysBack = 120) {
  const after = Math.floor((Date.now() - daysBack * 86400 * 1000) / 1000);
  let all = [];
  let page = 1;
  while (true) {
    const batch = await fetchActivities({ after, perPage: 100, page });
    if (!batch.length) break;
    all = [...all, ...batch];
    if (batch.length < 100) break;
    page++;
  }
  return all.filter(a => a.type === 'Run');
}

export async function fetchAthlete() {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch('https://www.strava.com/api/v3/athlete', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch athlete');
  return res.json();
}

// Fetch full gear details including lifetime distance from Strava
export async function fetchGear(gearId) {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`https://www.strava.com/api/v3/gear/${gearId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch gear ${gearId}`);
  return res.json();
}

// Fetch all unique gear from activities, return map of id -> full gear object
export async function fetchAllGear(activities) {
  const gearIds = [...new Set(activities.map(a => a.gear_id).filter(Boolean))];
  const results = await Promise.allSettled(gearIds.map(id => fetchGear(id)));
  const gearMap = {};
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      gearMap[gearIds[i]] = r.value;
    }
  });
  return gearMap;
}

export function metersToMiles(m) {
  return Math.round((m / 1609.34) * 100) / 100;
}

export function secondsToPace(seconds, meters) {
  const miles = meters / 1609.34;
  const secsPerMile = seconds / miles;
  const mins = Math.floor(secsPerMile / 60);
  const secs = Math.round(secsPerMile % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
