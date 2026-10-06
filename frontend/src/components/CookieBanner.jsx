import React from 'react';
import { Link } from 'react-router-dom';

export default function CookieBanner({ onAccept }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      zIndex: 9999,
      background: '#172B4D',
      color: 'white',
      borderRadius: '16px 16px 0 0',
      padding: '20px 20px 28px',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.25)',
      fontFamily: 'Space Grotesk, sans-serif',
      animation: 'slideUp 0.35s ease'
    }}>
      <style>{`@keyframes slideUp { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%) translateY(0); } }`}</style>

      {/* Handle bar */}
      <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 16px' }} />

      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>🍪</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Cookie Preferences</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#8993A4', marginBottom: 16 }}>
            We use cookies for login sessions and to remember your preferences.
            No tracking or ad cookies. Read our{' '}
            <Link to="/privacy" style={{ color: '#2684FF', textDecoration: 'none', fontWeight: 600 }}>
              Privacy Policy
            </Link>{' '}
            for details.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => onAccept(true)}
              style={{
                flex: 1,
                padding: '11px 0',
                background: '#0052CC',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              ✅ Accept All
            </button>
            <button
              onClick={() => onAccept(false)}
              style={{
                flex: 1,
                padding: '11px 0',
                background: 'transparent',
                color: '#8993A4',
                border: '1.5px solid #2C3E6B',
                borderRadius: 10,
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
