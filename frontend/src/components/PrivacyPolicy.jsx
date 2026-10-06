import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SECTIONS = [
  {
    icon: '🔍',
    title: 'Information We Collect',
    content: 'We collect your full name, email address, and a securely hashed version of your password upon registration. No additional personal data is collected without your explicit consent.'
  },
  {
    icon: '🍪',
    title: 'Cookie Usage',
    content: 'We use HTTP-only session cookies solely for authentication purposes. These cookies are essential for keeping you logged in and cannot be used for tracking. No third-party, advertising, or analytics cookies are set.'
  },
  {
    icon: '🗺️',
    title: 'Navigation Data',
    content: 'Route queries (the buildings you select as start and destination) are processed in real-time using Dijkstra\'s algorithm and are not stored or logged. Your navigation history remains private.'
  },
  {
    icon: '🔒',
    title: 'Data Security',
    content: 'Passwords are hashed using bcrypt with a cost factor of 12 before storage. All communication between your device and our server is secured. We do not sell, trade, or share your personal data with any third parties.'
  },
  {
    icon: '👤',
    title: 'Your Rights',
    content: 'You may request access to, correction of, or deletion of your personal data at any time. To exercise these rights, contact us using the information below. We will respond within 30 days.'
  },
  {
    icon: '🔄',
    title: 'Data Retention',
    content: 'Your account data is retained for as long as your account is active. Session cookies expire after 7 days of inactivity. Deleted accounts have all associated data removed within 30 days.'
  },
  {
    icon: '📧',
    title: 'Contact Us',
    content: 'For any privacy-related questions or data requests, contact the CampusNav team at privacy@campusnav.edu or visit the Help Desk in the Student Center.'
  }
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--card)',
      fontFamily: 'Space Grotesk, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(150deg, #0040A8 0%, #0066FF 100%)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.18)',
            border: 'none',
            color: 'white',
            width: 38,
            height: 38,
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          ←
        </button>
        <div>
          <h1 style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>Privacy Policy</h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12 }}>Effective: October 2024 · Version 1.0</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 40px' }}>
        {/* Intro */}
        <div style={{
          background: '#EBF5FF',
          border: '1px solid #BFDBFE',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 28,
          fontSize: 13,
          color: '#1D4ED8',
          lineHeight: 1.6
        }}>
          <strong>🛡️ Your privacy matters.</strong> CampusNav is built for students, and we take data protection seriously. This policy explains exactly what we collect and why.
        </div>

        {/* Sections */}
        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{s.title}</h2>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-muted)', paddingLeft: 30 }}>
              {s.content}
            </p>
            {i < SECTIONS.length - 1 && (
              <div style={{ height: 1, background: 'var(--border)', marginTop: 24 }} />
            )}
          </div>
        ))}

        {/* Footer */}
        <div style={{
          background: 'var(--bg)',
          borderRadius: 12,
          padding: '16px',
          textAlign: 'center',
          marginTop: 8
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            By using CampusNav, you accept this policy.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 32px' }}
          >
            ← Back to App
          </button>
        </div>
      </div>
    </div>
  );
}
