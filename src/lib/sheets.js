// lib/sheets.js — Google Sheets read helpers (public sheets via API key)

const API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
const TRAINING_PLAN_ID = process.env.REACT_APP_TRAINING_PLAN_SHEET_ID;
const CONFIG_ID = process.env.REACT_APP_CONFIG_SHEET_ID;

async function fetchSheet(spreadsheetId, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets fetch failed: ${res.status}`);
  const data = await res.json();
  return data.values || [];
}

// Training Plan — returns array of day objects
export async function fetchTrainingPlan() {
  const rows = await fetchSheet(TRAINING_PLAN_ID, 'A:G');
  if (rows.length < 2) return [];
  const [, ...data] = rows;
  return data.map(row => ({
    date: row[0] || '',
    day: row[1] || '',
    plannedMiles: parseFloat(row[2]) || 0,
    workoutType: row[3] || 'Easy',
    description: row[4] || '',
    status: row[5] || 'Planned',
    notes: row[6] || '',
  })).filter(r => r.date);
}

// Races — from config sheet
export async function fetchRaces() {
  const rows = await fetchSheet(CONFIG_ID, 'A:H');
  // Find the Races section
  const startIdx = rows.findIndex(r => r[0] === 'Race Name');
  if (startIdx === -1) return [];
  const data = [];
  for (let i = startIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] || row[0] === 'Shoes') break;
    data.push({
      name: row[0] || '',
      date: row[1] || '',
      distance: parseFloat(row[2]) || 26.2,
      goalTime: row[3] || '',
      goalType: row[4] || '',
      courseNotes: row[5] || '',
      status: row[6] || 'Upcoming',
      result: row[7] || '',
    });
  }
  return data.filter(r => r.name);
}

// Shoes — from config sheet
export async function fetchShoes() {
  const rows = await fetchSheet(CONFIG_ID, 'A:F');
  const startIdx = rows.findIndex(r => r[0] === 'Shoe Name');
  if (startIdx === -1) return [];
  const data = [];
  for (let i = startIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] || row[0] === 'Settings') break;
    data.push({
      name: row[0] || '',
      dateAcquired: row[1] || '',
      type: row[2] || '',
      retirementMiles: parseFloat(row[3]) || 500,
      notes: row[4] || '',
    });
  }
  return data.filter(r => r.name);
}

// Settings — from config sheet
export async function fetchSettings() {
  const rows = await fetchSheet(CONFIG_ID, 'A:C');
  const startIdx = rows.findIndex(r => r[0] === 'Key');
  if (startIdx === -1) return {};
  const settings = {};
  for (let i = startIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    settings[row[0]] = row[1] || '';
  }
  return settings;
}
