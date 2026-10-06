import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// ── Guard Rail Validators ────────────────────────────────────────────────────
const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validatePassword = (v) => v.length >= 6;
const validateName = (v) => v.trim().length >= 2;

export default function Login({ setUser }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (mode === 'register' && !validateName(form.name))
      e.name = 'Full name must be at least 2 characters';
    if (!validateEmail(form.email))
      e.email = 'Enter a valid email address';
    if (!validatePassword(form.password))
      e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email: form.email.trim(), password: form.password }
        : { name: form.name.trim(), email: form.email.trim(), password: form.password };
      const res = await axios.post(url, payload);
      setUser(res.data.user);
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
    if (serverError) setServerError('');
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
    setServerError('');
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--card)',
      fontFamily: 'Space Grotesk, sans-serif'
    }}>
      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(150deg, #0040A8 0%, #0066FF 60%, #0088FF 100%)',
        padding: '56px 24px 48px',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ fontSize: 60, marginBottom: 14, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}>🗺️</div>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.5px' }}>CampusNav</h1>
        <p style={{ opacity: 0.82, fontSize: 15, fontWeight: 400 }}>Find the shortest path on campus</p>

        {/* Algo badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          borderRadius: 99, padding: '6px 14px', marginTop: 16,
          fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)'
        }}>
          🧮 Powered by Dijkstra's Algorithm
        </div>
      </div>

      {/* ── Form Area ── */}
      <div style={{ padding: '28px 24px', flex: 1 }}>
        {/* Tab toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--bg)',
          borderRadius: 10,
          padding: 4,
          marginBottom: 28
        }}>
          {[
            { key: 'login',    label: '🔑 Sign In' },
            { key: 'register', label: '✨ Sign Up' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                cursor: 'pointer',
                background: mode === key ? 'white' : 'transparent',
                color: mode === key ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 14,
                fontFamily: 'Space Grotesk, sans-serif',
                borderRadius: 7,
                boxShadow: mode === key ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Name field (register only) */}
          {mode === 'register' && (
            <div className="fade-up">
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 7 }}>
                Full Name
              </label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Manideep Yada"
                className={errors.name ? 'error' : ''}
                maxLength={100}
                autoComplete="name"
              />
              {errors.name && <p className="error-msg">⚠️ {errors.name}</p>}
            </div>
          )}

          {/* Email */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 7 }}>
              Email Address
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@university.edu"
              className={errors.email ? 'error' : ''}
              maxLength={200}
              autoComplete="email"
            />
            {errors.email && <p className="error-msg">⚠️ {errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 7 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className={errors.password ? 'error' : ''}
                style={{ paddingRight: 48 }}
                maxLength={200}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p className="error-msg">⚠️ {errors.password}</p>}
          </div>

          {/* Server error */}
          {serverError && (
            <div style={{
              background: '#FFEBE6',
              border: '1px solid #FFBDAD',
              borderRadius: 10,
              padding: '12px 16px',
              color: '#BF2600',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              ❌ {serverError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading
              ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Please wait...</>
              : mode === 'login' ? '🔑 Sign In' : '🚀 Create Account'
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 28, lineHeight: 1.6 }}>
          By continuing, you agree to our{' '}
          <Link to="/privacy" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
