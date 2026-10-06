const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'campusnav_secret_key_2024';
const JWT_EXPIRY = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const USERS_FILE = path.join(__dirname, '../../data/users.json');
const LOGS_FILE = path.join(__dirname, '../../data/auth_logs.json');

// Helpers for file persistence
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch { return []; }
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
function logAction(email, action) {
  const logs = fs.existsSync(LOGS_FILE) ? JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8')) : [];
  logs.push({ timestamp: new Date().toISOString(), email, action });
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
}

// ── Guard Rails ────────────────────────────────────────────────────────────────
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validatePassword(password) { return typeof password === 'string' && password.length >= 6; }
function sanitizeString(str) { return typeof str === 'string' ? str.trim().slice(0, 200) : ''; }

// ── Routes ─────────────────────────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  try {
    const name  = sanitizeString(req.body.name);
    const email = sanitizeString(req.body.email).toLowerCase();
    const password = req.body.password || '';

    if (!name) return res.status(400).json({ error: 'Full name is required' });
    if (!validateEmail(email)) return res.status(400).json({ error: 'Enter a valid email address' });
    if (!validatePassword(password)) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    
    const users = readUsers();
    if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = { id: Date.now().toString(), name, email, password: hashed };
    users.push(user);
    saveUsers(users);
    logAction(email, 'REGISTER');

    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: COOKIE_MAX_AGE });
    res.status(201).json({ success: true, user: { id: user.id, name, email } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email    = sanitizeString(req.body.email).toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    
    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    logAction(email, 'LOGIN');
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: COOKIE_MAX_AGE });
    res.json({ success: true, user: { id: user.id, name: user.name, email } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      logAction(decoded.email, 'LOGOUT');
    }
  } catch (e) { /* ignore expired token on logout */ }
  
  res.clearCookie('token');
  res.json({ success: true });
});

router.get('/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readUsers();
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    res.clearCookie('token');
    res.status(401).json({ error: 'Session expired, please log in again' });
  }
});

module.exports = router;
