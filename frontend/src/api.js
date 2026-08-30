import axios from "axios";

/*
  ====================================================================
  MATCHED TO YOUR BACKEND FRIEND'S REAL ROUTES
  ====================================================================
  Base URL: http://localhost:5000
  Real, working endpoints:
    POST /api/auth/login
    GET  /api/wells/nearby?lat=&lng=&radius=
    GET  /api/wells/similar/:wellId?limit=
    GET  /api/wells/search?q=
    GET  /api/wells/:wellId
    POST /api/wells

  Still STUBS on the backend (return placeholder data for now):
    POST /predict-risk   -> always returns {risk:50, label:"stub"}
    POST /ai/query       -> always returns a placeholder sentence
  For these two, we use realistic mock logic on the frontend, clearly
  marked below, until she wires up the real ML/Gemini logic. Nothing
  else needs to change when she does — just delete the mock block.
  ====================================================================
*/

const BASE_URL = "http://localhost:5000";

const http = axios.create({ baseURL: BASE_URL, timeout: 8000 });

// Automatically attach the saved token to every request, exactly like
// the manual "Authorization: Bearer <token>" step in Postman.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- AUTH ----------
export async function loginEmployee(employeeId, password) {
  const res = await http.post("/api/auth/login", { employeeId, password });
  // res.data = { _id, employeeId, employeeName, token }
  return res.data;
}
  export async function registerEmployee(employeeId, employeeName, password) {
  const res = await http.post("/api/auth/register", { employeeId, employeeName, password });
  return res.data; // { _id, employeeId, employeeName, token }
}
// ---------- WELLS (real endpoints) ----------
export async function searchWells(query) {
  const res = await http.get("/api/wells/search", { params: { q: query } });
  return res.data.wells; // [{ wellId, wellName, field, block, status }]
}

export async function getWellByWellId(wellId) {
  const res = await http.get(`/api/wells/${wellId}`);
  return res.data; // full well object
}

export async function createWell(wellData) {
  const res = await http.post("/api/wells", wellData);
  return res.data;
}

export async function getNearbyWells(lat, lng, radiusKm) {
  const res = await http.get("/api/wells/nearby", {
    params: { lat, lng, radius: radiusKm },
  });
  return res.data.wells; // no distance field yet — we calculate it ourselves
}

export async function getSimilarWells(wellId, limit = 5) {
  const res = await http.get(`/api/wells/similar/${wellId}`, { params: { limit } });
  return res.data; // { targetWell, count, similarWells }
}

// ---------- helper: distance calculation (backend doesn't return this) ----------
export function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
}

// ---------- RISK PREDICTION (Mud Loss / Stuck Pipe / Overpressure) ----------
// // Backend endpoint is still a stub — using rule-based mock logic for now.
// // Swap USE_REAL_RISK_ENDPOINT to true once she confirms /predict-risk is real.
// const USE_REAL_RISK_ENDPOINT = false;

// export async function getRiskPrediction(depth, formation) {
//   if (USE_REAL_RISK_ENDPOINT) {
//     const res = await http.post("/predict-risk", { depth, formation });
//     return res.data;
//   }
//   // Rule-based mock — same honest logic your build guide used for the ML service.
//   const mudLoss = depth % 500 < 150 ? 78 : 25;
//   const stuckPipe = depth % 700 < 200 ? 55 : 18;
//   const overpressure = depth > 3000 ? 62 : 15;
//   return { mud_loss_risk: mudLoss, stuck_pipe_risk: stuckPipe, overpressure_risk: overpressure };
// }
export async function getRiskPrediction(wellId) {
  const res = await http.get(`/api/risk/${wellId}`);
  return res.data; // { wellId, timestamp, depth, prediction: { Mud_Loss_Label: {...}, Stuck_Pipe_Label: {...}, Kick_Label: {...} } }
}

export async function getRiskExplanation(wellId) {
  const res = await http.get(`/api/risk/${wellId}/explain`);
  return res.data; // { wellId, timestamp, depth, explanation: { Mud_Loss_Label: [...5], Stuck_Pipe_Label: [...], Kick_Label: [...] } }
}

// ---------- HISTORICAL DOCUMENT SEARCH (Gemini) ----------
// Backend endpoint is still a stub — using mock answer for now.
const USE_REAL_AI_ENDPOINT = false;

export async function askHistoricalQuestion(question) {
  if (USE_REAL_AI_ENDPOINT) {
    const res = await http.post("/ai/query", { question });
    return res.data;
  }
  return {
    answer:
      "Nearby wells recorded mud-loss events in this depth range. LCM treatment successfully controlled losses in similar cases.",
    source: "Matched historical event record",
  };
}
