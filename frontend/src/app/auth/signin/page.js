'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error,    setError]    = useState('');
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleGoogle = () => {
    setGLoading(true);
    setError('');
    signIn('google', { callbackUrl: '/' });
  };

  const handleCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      email: form.email, password: form.password, redirect: false,
    });
    setLoading(false);
    if (res?.error) setError(res.error);
    else router.push('/');
  };

  const STATS = [
    { value: '5+',    label: 'Platforms Analysed', icon: '🌐' },
    { value: '1000+', label: 'Reviews Tracked',     icon: '📊' },
    { value: '3',     label: 'NLP Models Used',     icon: '🧠' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Hind, sans-serif', background: '#f8f9fc' }}>

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div style={{
        flex: '0 0 45%', background: '#0a1628',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 56px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,100,12,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,100,12,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 340 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}>
            <img src="/logo.png" alt="BPIT Logo" style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(232,100,12,0.4)', boxShadow: '0 4px 20px rgba(232,100,12,0.25)' }} />
            <div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: 'white', letterSpacing: '0.5px', lineHeight: 1 }}>
                BP<span style={{ color: '#e8640c' }}>IT</span> Pulse
              </div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 4 }}>
                Social Media Analyser
              </div>
            </div>
          </div>

          {/* Headline */}
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 700, color: 'white', lineHeight: 1.25, marginBottom: 12 }}>
            What does the internet<br />say about <span style={{ color: '#e8640c' }}>BPIT?</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: 48 }}>
            Real-time sentiment from across the web — all in one dashboard.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '16px 20px',
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(232,100,12,0.12)', border: '1px solid rgba(232,100,12,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#e8640c', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Live badge */}
          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'blink 2s infinite' }} />
            <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)' }}>Live · Updated on every analysis run</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', background: '#f8f9fc' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
  <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.2rem', fontWeight: 700, color: '#0a1628', marginBottom: 8, letterSpacing: '-0.3px' }}>
    Welcome back
  </h1>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
              Sign in to access your dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '0.84rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCredentials}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                BPIT Email
              </label>
              <input
                type="email" required placeholder="yourname@bpit.edu.in"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={{ width: '100%', padding: '13px 16px', fontSize: '0.92rem', border: '1.5px solid #e5e7eb', borderRadius: 10, outline: 'none', fontFamily: 'Hind, sans-serif', color: '#1a2340', background: 'white', boxSizing: 'border-box', transition: 'border-color 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                onFocus={e => e.target.style.borderColor = '#e8640c'}
                onBlur={e  => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} required placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ width: '100%', padding: '13px 44px 13px 16px', fontSize: '0.92rem', border: '1.5px solid #e5e7eb', borderRadius: 10, outline: 'none', fontFamily: 'Hind, sans-serif', color: '#1a2340', background: 'white', boxSizing: 'border-box', transition: 'border-color 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                  onFocus={e => e.target.style.borderColor = '#e8640c'}
                  onBlur={e  => e.target.style.borderColor = '#e5e7eb'}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af', padding: 0 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#d1a070' : '#e8640c',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: '1rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.5px',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(232,100,12,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#c8540a'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#e8640c'; }}>
              {loading
                ? <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Signing in...</>
                : 'Sign In →'
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={gLoading} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12,
            padding: '13px 24px', fontSize: '0.95rem', fontWeight: 600, color: '#374151',
            cursor: gLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.2s',
            fontFamily: 'Hind, sans-serif',
          }}
          onMouseEnter={e => { if (!gLoading) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}>
            {gLoading
              ? <span style={{ width: 20, height: 20, border: '2px solid #e5e7eb', borderTop: '2px solid #e8640c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              : <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
            }
            {gLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          {/* Bottom links */}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <p style={{ fontSize: '0.83rem', color: '#9ca3af', margin: '0 0 8px' }}>
              New to BPIT Pulse?{' '}
              <Link href="/auth/signup" style={{ color: '#e8640c', fontWeight: 600, textDecoration: 'none' }}>
                Create account
              </Link>
            </p>
            <Link href="/" style={{ fontSize: '0.76rem', color: '#9ca3af', textDecoration: 'none' }}>
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}