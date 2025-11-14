

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// ----- Config  -----
const ACCESS_TOKEN_SECRET = 'replace_this_with_strong_secret';
const ACCESS_TOKEN_EXPIRES_IN = '5m';        // short-lived access token
const REFRESH_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PORT = 4000;

// ----- In-memory stores  -----
// sessionStore maps sessionId -> { userId, currentRefreshToken, deviceId, expiresAt, createdAt }
const sessionStore = new Map();

// userStore 
const userStore = new Map([
  ['alice', { id: 'u1', username: 'alice', password: 'password123' }]
]);

// ----- Helpers -----
function randomToken(len = 40) {
  return crypto.randomBytes(len).toString('hex');
}

function generateAccessToken(userId) {
  // short-lived JWT; put minimal claims
  return jwt.sign({ sub: userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function issueRefreshToken(sessionId, deviceId) {
  // opaque refresh token containing a jti we keep server-side
  const token = randomToken(32);
  const jti = crypto.createHash('sha256').update(token).digest('hex'); // demo jti
  const expiresAt = Date.now() + REFRESH_TOKEN_TTL_MS;

  // store as current refresh token for the session (rotation)
  sessionStore.set(sessionId, {
    ...(sessionStore.get(sessionId) || {}),
    currentRefreshJti: jti,
    currentRefreshToken: token,
    deviceId,
    refreshExpiresAt: expiresAt,
    lastRotatedAt: Date.now()
  });

  return { token, jti, expiresAt };
}

function revokeSession(sessionId) {
  sessionStore.delete(sessionId);
}

// ----- Endpoints -----

// 1) Login -> issues access + refresh tokens
app.post('/auth/login', (req, res) => {
  const { username, password, deviceId } = req.body;
  if (!username || !password || !deviceId) return res.status(400).send('username, password, deviceId required');

  const user = userStore.get(username);
  if (!user || user.password !== password) return res.status(401).send('Invalid credentials');

  // create session id (server-side)
  const sessionId = randomToken(16);
  // store basic session record
  sessionStore.set(sessionId, {
    userId: user.id,
    createdAt: Date.now()
  });

  const accessToken = generateAccessToken(user.id);
  const refresh = issueRefreshToken(sessionId, deviceId);

  // deliver tokens:
  // - access token returned in body (client keeps in memory)
  // - refresh token in response body here (demo). In web real-world: send HttpOnly Secure cookie
  res.json({
    sessionId,
    accessToken,
    refreshToken: refresh.token,
    refreshExpiresAt: new Date(refresh.expiresAt).toISOString()
  });
});

// 2) Protected route example (requires valid access token)
app.get('/api/protected', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).send('Missing token');

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return res.json({ ok: true, userId: payload.sub, message: 'Protected data' });
  } catch (err) {
    return res.status(401).send('Invalid or expired access token');
  }
});

// 3) Refresh endpoint: client sends sessionId + refreshToken + deviceId
//    Server validates current refresh JTI for that session, rotates, or detects reuse.
app.post('/auth/refresh', (req, res) => {
  const { sessionId, refreshToken, deviceId } = req.body;
  if (!sessionId || !refreshToken || !deviceId) return res.status(400).send('sessionId, refreshToken, deviceId required');

  const session = sessionStore.get(sessionId);
  if (!session) return res.status(401).send('Unknown session');

  // quick TTL check
  if (session.refreshExpiresAt && Date.now() > session.refreshExpiresAt) {
    revokeSession(sessionId);
    return res.status(401).send('Refresh token expired - re-login required');
  }

  // compute jti of provided refresh token (demo hashing)
  const presentedJti = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // CASE A: presented token matches server-recorded current token -> OK, rotate
  if (presentedJti === session.currentRefreshJti && deviceId === session.deviceId) {
    // rotate: issue new refresh token and new access token
    const newRefresh = issueRefreshToken(sessionId, deviceId);
    const newAccess = generateAccessToken(session.userId);

    return res.json({
      accessToken: newAccess,
      refreshToken: newRefresh.token,
      refreshExpiresAt: new Date(newRefresh.expiresAt).toISOString()
    });
  }

  // CASE B: presented token DOES NOT MATCH current jti -> possible reuse/theft
  // Detection: revoke session and force re-login. In production, log details and notify user/admin.
  // Optionally, you could check whether presentedJti exists elsewhere (indicates token stolen and used elsewhere).
  revokeSession(sessionId);
  console.warn(`Possible refresh token reuse or device mismatch for session ${sessionId}. Presented device=${deviceId}, expected=${session.deviceId}`);
  return res.status(403).json({ error: 'Refresh token invalid or reused — session revoked. Re-login required.' });
});

// 4) Logout (revoke session)
app.post('/auth/logout', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).send('sessionId required');
  revokeSession(sessionId);
  res.send('Logged out');
});

// 5) Admin: list active sessions (demo)
app.get('/admin/sessions', (req, res) => {
  const sessions = [];
  for (const [id, data] of sessionStore.entries()) {
    sessions.push({ sessionId: id, ...data });
  }
  res.json(sessions);
});

// ----- Start demo server -----
app.listen(PORT, () => {
  console.log(`Demo auth server listening on http://localhost:${PORT}`);
  console.log('This demo shows access tokens (JWT), refresh rotation, device-binding, and revoke on reuse.');
});

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore";

// ---------------------------
//  Firebase Config 
const firebaseConfig = {
  apiKey: "AIzaSyDUMMY-FIREBASE-KEY-DEMO123",
  authDomain: "surakshanet-demo.firebaseapp.com",
  projectId: "surakshanet-demo",
  storageBucket: "surakshanet-demo.appspot.com",
  messagingSenderId: "123456789000",
  appId: "1:123456789000:web:abcdef1234567890"
};

// Initialize Firebase App + Firestore
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);


// Function to add a simulated threat log
export async function logThreat(eventType, severity, details) {
  try {
    const ref = await addDoc(collection(db, "threat_logs"), {
      eventType,
      severity,
      details,
      createdAt: Timestamp.now(),
      verified: false
    });
    console.log(`✅ Threat log added successfully with ID: ${ref.id}`);
  } catch (error) {
    console.error("❌ Error adding log:", error);
  }
}

// Function to fetch and display recent logs
export async function fetchThreatLogs() {
  try {
    const q = query(collection(db, "threat_logs"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    console.log("📜 Recent Threat Logs:");
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- [${data.severity}] ${data.eventType}: ${data.details.note}`);
    });
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
  }
}


async function runDemo() {
  console.log("🚀 Firebase Threat Log Demo Started...\n");

  // 1️⃣ Add new threat log
  await logThreat("Unauthorized Access", "High", {
    sourceIP: "192.168.1.15",
    username: "admin",
    note: "Multiple failed login attempts detected"
  });

  // 2️⃣ Fetch and display all stored logs
  await fetchThreatLogs();

  console.log("\n⚠️ Note: In SurakshaNet, these logs are instead verified, hashed, and stored immutably on our blockchain layer.");
}

runDemo();
