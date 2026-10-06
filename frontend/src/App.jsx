import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookieBanner from './components/CookieBanner';

axios.defaults.withCredentials = true;

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cookieConsent, setCookieConsent] = useState(null);

  useEffect(() => {
    // Check stored cookie consent
    const stored = localStorage.getItem('cookieConsent');
    if (stored !== null) setCookieConsent(stored === 'true');

    // Restore session
    axios.get('/api/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleCookieResponse = (accepted) => {
    localStorage.setItem('cookieConsent', String(accepted));
    setCookieConsent(accepted);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh', gap: 16,
        fontFamily: 'Space Grotesk, sans-serif'
      }}>
        <span style={{ fontSize: 48 }}>🗺️</span>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>Loading CampusNav...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {cookieConsent === null && (
        <CookieBanner onAccept={handleCookieResponse} />
      )}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login setUser={setUser} />}
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route
          path="/"
          element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
