'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
  const router = useRouter();
  const [gLoading, setGLoading] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [form,     setForm]     = useState({ name: '', email: '', password: '' });

  // ── Google ────────────────────────────────────────────────
  const handleGoogle = () => {
    setGLoading(true);
    signIn('google', { callbackUrl: '/' });
  };

  // ── Email / Password Register ─────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

     setSuccess('Account created successfully! Please sign in.');
     setLoading(false);
      setTimeout(() => {
        router.push('/auth/signin');
      }, 1500);

      

    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px', fontSize: '0.92rem',
    border: '1.5px solid #dde3ef', borderRadius: 10, outline: 'none',
    fontFamily: 'Hind, sans-serif', color: '#1a2340', background: 'white',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Hind, sans-serif' }}>

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div style={{ flex: '0 0 48%', background: '#0a1628', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 56px' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -80, right: -80, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,100,12,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
           <img src="/logo.png" alt="BPIT Logo" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover', flexShrink: 0, boxShadow: '0 8px 24px rgba(232,100,12,0.35)' }} />
            <div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'white', letterSpacing: '0.5px', lineHeight: 1 }}>
                BP<span style={{ color: '#e8640c' }}>IT</span> Pulse
              </div>
              <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.8px', textTransform: 'uppercase', marginTop: 4 }}>
                Social Media Analyser
              </div>
            </div>
          </div>

          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.2rem', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>
            Join the community<br />of <span style={{ color: '#e8640c' }}>BPIT</span> researchers
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.85, marginBottom: 44 }}>
            Get access to real-time sentiment data, platform breakdowns and detailed analytics — completely free.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { step: '01', title: 'Create your account',       desc: 'Use BPIT email or Google to sign up'          },
              { step: '02', title: 'Run platform analysis',     desc: 'Scrape and analyse reviews from 5+ platforms' },
              { step: '03', title: 'Explore the dashboard',     desc: 'View charts, trends and sentiment insights'   },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(232,100,12,0.14)', border: '1px solid rgba(232,100,12,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#e8640c' }}>{s.step}</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'white', marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', background: '#f4f6fb' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
           <img src="/logo.png" alt="BPIT Logo" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover', flexShrink: 0, boxShadow: '0 8px 24px rgba(232,100,12,0.35)' }} />
            <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 700, color: '#0a1628', marginBottom: 8, letterSpacing: '-0.3px' }}>Create account</h1>
            <p style={{ fontSize: '0.9rem', color: '#8898aa', margin: 0, lineHeight: 1.6 }}>
              Only <strong style={{ color: '#e8640c' }}>@bpit.edu.in</strong> emails are allowed
            </p>
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: '0.84rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(22,163,74,0.08)', border: '1.5px solid rgba(22,163,74,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: '0.84rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              ✅ {success}
            </div>
          )}

          {/* ── Register Form ─────────────────────────────── */}
          <form onSubmit={handleRegister} style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1a2340', marginBottom: 6 }}>Full Name</label>
              <input
                type="text" required placeholder="Your full name"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#e8640c'}
                onBlur={e  => e.target.style.borderColor = '#dde3ef'}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1a2340', marginBottom: 6 }}>BPIT Email</label>
              <input
                type="email" required placeholder="yourname@bpit.edu.in"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#e8640c'}
                onBlur={e  => e.target.style.borderColor = '#dde3ef'}
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1a2340', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} required placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = '#e8640c'}
                  onBlur={e  => e.target.style.borderColor = '#dde3ef'}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#8898aa', padding: 0 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#8898aa' : '#e8640c', color: 'white', border: 'none', borderRadius: 12, fontSize: '0.98rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.5px', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading
                ? <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Creating account...</>
                : 'Create Account →'
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#dde3ef' }} />
            <span style={{ fontSize: '0.78rem', color: '#8898aa', fontWeight: 500 }}>or sign up with</span>
            <div style={{ flex: 1, height: 1, background: '#dde3ef' }} />
          </div>

          {/* Google Button */}
          <button onClick={handleGoogle} disabled={gLoading} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            background: gLoading ? '#f4f6fb' : 'white',
            border: '1.5px solid #dde3ef', borderRadius: 14,
            padding: '14px 24px', fontSize: '0.98rem', fontWeight: 600, color: '#1a2340',
            cursor: gLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(10,22,40,0.08)', transition: 'all 0.25s',
            fontFamily: 'Hind, sans-serif', marginBottom: 20,
          }}
          onMouseEnter={e => { if (!gLoading) { e.currentTarget.style.borderColor = '#b0bdd0'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(10,22,40,0.14)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#dde3ef'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(10,22,40,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {gLoading
              ? <span style={{ width: 22, height: 22, border: '2.5px solid #dde3ef', borderTop: '2.5px solid #e8640c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              : <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
            }
            {gLoading ? 'Redirecting...' : 'Sign up with Google'}
          </button>

          {/* Bottom links */}
          <div style={{ borderTop: '1px solid #dde3ef', paddingTop: 22, textAlign: 'center' }}>
            <p style={{ fontSize: '0.82rem', color: '#8898aa', margin: '0 0 8px' }}>
              Already have an account?{' '}
              <Link href="/auth/signin" style={{ color: '#e8640c', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
            <Link href="/" style={{ fontSize: '0.76rem', color: '#8898aa', textDecoration: 'none' }}>
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}