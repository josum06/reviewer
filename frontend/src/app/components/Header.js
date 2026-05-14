'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

// Real SVG logos for each platform
const PLATFORM_LOGOS = {
  Dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.7"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.7"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5"/>
    </svg>
  ),
  Reddit: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#FF4500"/>
      <path d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.16.16 0 00-.19.12l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.47-1.5z" fill="white"/>
      <circle cx="8.18" cy="11.06" r=".9" fill="#FF4500"/>
      <circle cx="11.82" cy="11.06" r=".9" fill="#FF4500"/>
      <path d="M12.57 13a3.3 3.3 0 01-2.57.9 3.3 3.3 0 01-2.57-.9.16.16 0 00-.22.22 3.6 3.6 0 002.79 1 3.6 3.6 0 002.79-1 .16.16 0 00-.22-.22z" fill="#FF4500"/>
    </svg>
  ),
  Shiksha: (
    <svg width="16" height="16" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#00897B"/>
      <path d="M18 30 C14 30 10.5 25.5 10.5 20 C10.5 14.5 14 10 18 8 C22 10 25.5 14.5 25.5 20 C25.5 25.5 22 30 18 30 Z" fill="white"/>
      <path d="M18 27 C15.5 27 13.5 24 13.5 20 C13.5 16.5 15.5 13.5 18 12 C20.5 13.5 22.5 16.5 22.5 20 C22.5 24 20.5 27 18 27 Z" fill="#00897B"/>
      <ellipse cx="18" cy="12" rx="5" ry="1.5" fill="#E6A817"/>
      <rect x="11" y="9" width="14" height="2.5" rx="1.2" fill="white"/>
      <polygon points="18,5 10,9 26,9" fill="white"/>
    </svg>
  ),
  Careers360: (
    // Purple circle with white C cutout + dot
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#5C6BC0"/>
      <circle cx="12" cy="13" r="6" fill="white"/>
      <circle cx="12" cy="13" r="4" fill="#5C6BC0"/>
      <rect x="14" y="10" width="6" height="6" fill="#5C6BC0"/>
      <circle cx="17" cy="7.5" r="2.5" fill="white"/>
    </svg>
  ),
  YouTube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#FF0000"/>
      <path d="M19.8 7.2a2.5 2.5 0 00-1.76-1.77C16.66 5 12 5 12 5s-4.66 0-6.04.43A2.5 2.5 0 004.2 7.2 26 26 0 003.77 12a26 26 0 00.43 4.8 2.5 2.5 0 001.76 1.77C7.34 19 12 19 12 19s4.66 0 6.04-.43a2.5 2.5 0 001.76-1.77A26 26 0 0020.23 12a26 26 0 00-.43-4.8z" fill="white"/>
      <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="#FF0000"/>
    </svg>
  ),
  Collegedunia: (
    // Dark bg with glasses face
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#1a1a2e"/>
      <ellipse cx="12" cy="13" rx="6" ry="7" fill="#e8c9a0"/>
      <ellipse cx="12" cy="7" rx="6" ry="3.5" fill="#2d1b00"/>
      <ellipse cx="8.5" cy="7.5" rx="2" ry="3" fill="#2d1b00"/>
      <ellipse cx="8" cy="6.5" rx="1" ry="2" fill="#cc0000" transform="rotate(-15 8 6.5)"/>
      <circle cx="9.5" cy="13.5" r="2.5" fill="white" stroke="#222" strokeWidth="1"/>
      <circle cx="14.5" cy="13.5" r="2.5" fill="white" stroke="#222" strokeWidth="1"/>
      <circle cx="9.5" cy="14" r="1" fill="#333"/>
      <circle cx="14.5" cy="14" r="1" fill="#333"/>
      <rect x="12" y="13" width="0.5" height="0.5" fill="#222"/>
      <path d="M10 16.5 Q12 17.5 14 16.5" stroke="#333" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
    </svg>
  ),
};

const NAV_LINKS = [
  { href: '/',             label: 'Dashboard'   },
  { href: '/reddit',       label: 'Reddit'      },
  { href: '/shiksha',      label: 'Shiksha'     },
  { href: '/careers360',   label: 'Careers360'  },
  { href: '/youtube',      label: 'YouTube'     },
  { href: '/collegedunia', label: 'Collegedunia'},
];

// Per-platform accent colors for active state
const PLATFORM_COLORS = {
  '/':             '#e8640c',
  '/reddit':       '#FF4500',
  '/shiksha':      '#00897B',
  '/careers360':   '#5C6BC0',
  '/youtube':      '#FF0000',
  '/collegedunia': '#1a1a2e',
};

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);
  const pathname  = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = () => {
    setDropOpen(false);
    signOut({ callbackUrl: '/auth/signin' });
  };

  const activeColor = PLATFORM_COLORS[pathname] || '#e8640c';

  return (
    <>
      {/* TOP BAR */}
      <div style={{ background: '#0a1628', padding: '7px 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {[
            { icon: '📍', text: 'Rohini, New Delhi - 110085' },
            { icon: '📞', text: '+91-11-27555122'            },
            { icon: '✉️', text: 'info@bpitindia.com'         },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.73rem', color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ fontSize: 12 }}>{item.icon}</span>{item.text}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            { label: 'f',  href: 'https://facebook.com/bpitindia',        hoverBg: '#1877F2' },
            { label: '𝕏',  href: 'https://twitter.com/bpitindia',         hoverBg: '#000000' },
            { label: 'in', href: 'https://linkedin.com/school/bpitindia', hoverBg: '#0A66C2' },
            { label: '▶',  href: 'https://youtube.com/@bpitindia',        hoverBg: '#FF0000' },
          ].map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
              style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = s.hoverBg; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = s.hoverBg; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* MAIN NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'white',
        borderBottom: `3px solid ${activeColor}`,
        boxShadow: scrolled ? '0 4px 24px rgba(10,22,40,0.1)' : 'none',
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                <Image src="/logo.png" alt="BPIT Pulse" width={48} height={48} style={{ objectFit: 'contain', borderRadius: 12 }} priority />
              </div>
            <div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: '#0a1628', letterSpacing: '0.5px', lineHeight: 1 }}>
                BP<span style={{ color: '#e8640c' }}>IT</span> Pulse
              </div>
              <div style={{ fontSize: '0.6rem', color: '#8898aa', fontWeight: 500, letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: 3 }}>
                Social Media Analyser
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <ul style={{ display: 'flex', alignItems: 'center', gap: 2, listStyle: 'none', margin: 0, padding: 0 }}>
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.href;
              const linkColor = PLATFORM_COLORS[link.href] || '#e8640c';
              return (
                <li key={link.href}>
                  <Link href={link.href} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 11px', borderRadius: 8,
                    fontFamily: 'Rajdhani, sans-serif', fontSize: '0.9rem', fontWeight: 600,
                    letterSpacing: '0.3px', textDecoration: 'none',
                    color: isActive ? linkColor : '#4a5568',
                    background: isActive ? `${linkColor}15` : 'transparent',
                    border: isActive ? `1.5px solid ${linkColor}30` : '1.5px solid transparent',
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = linkColor; e.currentTarget.style.background = `${linkColor}10`; e.currentTarget.style.borderColor = `${linkColor}25`; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#4a5568'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}}>
                    {/* Platform logo */}
                    <span style={{ display: 'flex', alignItems: 'center', color: isActive ? linkColor : '#8898aa', transition: 'color 0.18s', flexShrink: 0 }}>
                      {PLATFORM_LOGOS[link.label]}
                    </span>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Live badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#0a1628', color: 'white', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.5px', padding: '7px 14px', borderRadius: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'blink 2s infinite', display: 'inline-block' }} />
              Live Analysis
            </div>

            {/* Auth */}
            {status === 'loading' ? (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f4f6fb', border: '1.5px solid #dde3ef' }} />
            ) : user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setDropOpen(o => !o)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#f4f6fb', border: '1.5px solid #dde3ef',
                  borderRadius: 10, padding: '6px 12px 6px 6px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#c5cfe0'}
                onMouseLeave={e => { if (!dropOpen) e.currentTarget.style.borderColor = '#dde3ef'; }}>
                  {user.image
                    ? <img src={user.image} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8640c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', fontWeight: 700 }}>
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                  }
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#0a1628', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0] || 'User'}
                  </span>
                  <span style={{ fontSize: 10, color: '#8898aa' }}>▾</span>
                </button>

                {dropOpen && (
                  <div style={{ position: 'absolute', top: '110%', right: 0, background: 'white', border: '1.5px solid #dde3ef', borderRadius: 12, boxShadow: '0 8px 30px rgba(10,22,40,0.12)', minWidth: 200, zIndex: 200, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #dde3ef' }}>
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#0a1628' }}>{user.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#8898aa', marginTop: 2 }}>{user.email}</div>
                    </div>
                    <button onClick={handleSignOut} style={{
                      width: '100%', textAlign: 'left', padding: '12px 16px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '0.85rem', color: '#dc2626', fontWeight: 600,
                      fontFamily: 'Hind, sans-serif', display: 'flex', alignItems: 'center', gap: 8,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#e8640c', color: 'white',
                padding: '8px 18px', borderRadius: 8,
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                fontSize: '0.88rem', letterSpacing: '0.3px', textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#0a1628'}
              onMouseLeave={e => e.currentTarget.style.background = '#e8640c'}>
                Sign In →
              </Link>
            )}

            <button onClick={() => setMenuOpen(o => !o)} id="hamburger"
              style={{ display: 'none', background: '#f4f6fb', border: '1.5px solid #dde3ef', borderRadius: 8, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: '#0a1628' }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ background: 'white', borderTop: '1px solid #dde3ef', padding: '12px 24px 20px' }}>
            {NAV_LINKS.map(link => {
              const lc = PLATFORM_COLORS[link.href] || '#e8640c';
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, fontFamily: 'Rajdhani, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: isActive ? lc : '#4a5568', background: isActive ? `${lc}12` : 'transparent', textDecoration: 'none', marginBottom: 2 }}>
                  <span style={{ color: isActive ? lc : '#8898aa' }}>{PLATFORM_LOGOS[link.label]}</span>
                  {link.label}
                </Link>
              );
            })}
            {!user && (
              <Link href="/auth/signin" style={{ display: 'block', marginTop: 10, padding: '10px 12px', borderRadius: 8, background: '#e8640c', color: 'white', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', textAlign: 'center' }}>
                Sign In
              </Link>
            )}
          </div>
        )}
      </nav>

      {dropOpen && <div onClick={() => setDropOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @media(max-width:1024px) { #hamburger{display:flex !important;} nav ul{display:none !important;} }
      `}</style>
    </>
  );
}