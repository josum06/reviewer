'use client';
import { useState } from 'react';
import Link from 'next/link';

const SENTIMENT_COLOR = { POSITIVE: '#16a34a', NEGATIVE: '#dc2626', NEUTRAL: '#d97706' };
const SENTIMENT_BG    = { POSITIVE: 'rgba(22,163,74,0.10)', NEGATIVE: 'rgba(220,38,38,0.10)', NEUTRAL: 'rgba(217,119,6,0.10)' };

// Real SVG logos (same as PlatformPage/Header)
const PLATFORM_LOGOS = {
  Reddit: (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#FF4500"/>
      <path d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.16.16 0 00-.19.12l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.47-1.5z" fill="white"/>
      <circle cx="8.18" cy="11.06" r=".9" fill="#FF4500"/>
      <circle cx="11.82" cy="11.06" r=".9" fill="#FF4500"/>
      <path d="M12.57 13a3.3 3.3 0 01-2.57.9 3.3 3.3 0 01-2.57-.9.16.16 0 00-.22.22 3.6 3.6 0 002.79 1 3.6 3.6 0 002.79-1 .16.16 0 00-.22-.22z" fill="#FF4500"/>
    </svg>
  ),
  Shiksha: (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#00897B"/>
      <path d="M18 30 C14 30 10.5 25.5 10.5 20 C10.5 14.5 14 10 18 8 C22 10 25.5 14.5 25.5 20 C25.5 25.5 22 30 18 30 Z" fill="white"/>
      <path d="M18 27 C15.5 27 13.5 24 13.5 20 C13.5 16.5 15.5 13.5 18 12 C20.5 13.5 22.5 16.5 22.5 20 C22.5 24 20.5 27 18 27 Z" fill="#00897B"/>
      <ellipse cx="18" cy="12" rx="5" ry="1.5" fill="#E6A817"/>
      <rect x="11" y="9" width="14" height="2.5" rx="1.2" fill="white"/>
      <polygon points="18,5 10,9 26,9" fill="white"/>
    </svg>
  ),
  Careers360: (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="18" fill="#5C6BC0"/>
      <circle cx="18" cy="19" r="9" fill="white"/>
      <circle cx="18" cy="19" r="6" fill="#5C6BC0"/>
      <rect x="21" y="15" width="8" height="8" fill="#5C6BC0"/>
      <circle cx="25" cy="11" r="3.5" fill="white"/>
    </svg>
  ),
  YouTube: (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#FF0000"/>
      <path d="M29.7 11.8a3.15 3.15 0 00-2.22-2.23C25.56 9 18 9 18 9s-7.56 0-9.48.57A3.15 3.15 0 006.3 11.8 33 33 0 005.84 18a33 33 0 00.56 6.2 3.15 3.15 0 002.22 2.23C10.44 27 18 27 18 27s7.56 0 9.48-.57a3.15 3.15 0 002.22-2.23A33 33 0 0030.16 18a33 33 0 00-.56-6.2z" fill="white"/>
      <polygon points="15,22.5 22.5,18 15,13.5" fill="#FF0000"/>
    </svg>
  ),
  Collegedunia: (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#1a1a2e"/>
      <ellipse cx="18" cy="17" rx="9" ry="10" fill="#e8c9a0"/>
      <ellipse cx="18" cy="9" rx="9" ry="5" fill="#2d1b00"/>
      <ellipse cx="13" cy="10" rx="3" ry="4" fill="#2d1b00"/>
      <ellipse cx="12" cy="8" rx="1.5" ry="3" fill="#cc0000" transform="rotate(-15 12 8)"/>
      <circle cx="14.5" cy="18" r="3.5" fill="white" stroke="#222" strokeWidth="1.2"/>
      <circle cx="21.5" cy="18" r="3.5" fill="white" stroke="#222" strokeWidth="1.2"/>
      <rect x="17.5" y="17.5" width="1" height="1" fill="#333"/>
      <circle cx="14.5" cy="18.5" r="1.5" fill="#333"/>
      <circle cx="21.5" cy="18.5" r="1.5" fill="#333"/>
      <circle cx="14.5" cy="18" r="3.5" fill="none" stroke="#222" strokeWidth="1.5"/>
      <circle cx="21.5" cy="18" r="3.5" fill="none" stroke="#222" strokeWidth="1.5"/>
      <path d="M11 18 Q11 15 13 15" stroke="#222" strokeWidth="1.2" fill="none"/>
      <path d="M25 18 Q25 15 23 15" stroke="#222" strokeWidth="1.2" fill="none"/>
      <path d="M15 22 Q18 24 21 22" stroke="#333" strokeWidth="1" fill="none" strokeLinecap="round"/>
    </svg>
  ),
};

const PLATFORM_META = {
  Reddit:       { color: '#FF4500', href: '/reddit'       },
  Shiksha:      { color: '#00897B', href: '/shiksha'      },
  Careers360:   { color: '#5C6BC0', href: '/careers360'   },
  YouTube:      { color: '#FF0000', href: '/youtube'      },
  Collegedunia: { color: '#1a1a2e', href: '/collegedunia' },
};

function PieChart({ pos, neg, neu, total }) {
  if (!total) return null;
  const slices = [
    { pct: pos/total, color: '#16a34a', label: 'Positive', count: pos },
    { pct: neg/total, color: '#dc2626', label: 'Negative', count: neg },
    { pct: neu/total, color: '#d97706', label: 'Neutral',  count: neu },
  ];
  let cumulative = 0;
  const r = 80, cx = 100, cy = 100;
  const paths = slices.map((s, i) => {
    if (s.pct === 0) return null;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += s.pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = s.pct > 0.5 ? 1 : 0;
    return <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={s.color} stroke="white" strokeWidth="2.5" />;
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
      <svg viewBox="0 0 200 200" style={{ width: 160, height: 160, flexShrink: 0, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>{paths}</svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, boxShadow: `0 2px 6px ${s.color}60` }} />
            <span style={{ fontSize: '0.83rem', color: '#4a5568', fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: s.color }}>{(s.pct*100).toFixed(1)}%</span>
            <span style={{ fontSize: '0.75rem', color: '#8898aa' }}>({s.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ pos, neg, neu }) {
  const max = Math.max(pos, neg, neu, 1);
  const bars = [
    { label: 'Positive', value: pos, color: '#16a34a' },
    { label: 'Negative', value: neg, color: '#dc2626' },
    { label: 'Neutral',  value: neu, color: '#d97706' },
  ];
  const chartH = 160, barW = 60, gap = 30, padL = 40;
  return (
    <svg viewBox={`0 0 ${padL + bars.length * (barW + gap)} ${chartH + 40}`} style={{ width: '100%', maxWidth: 340 }}>
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <g key={p}>
          <line x1={padL} y1={chartH - p*chartH} x2={padL + bars.length*(barW+gap)} y2={chartH - p*chartH} stroke="#dde3ef" strokeWidth="1" />
          <text x={padL-4} y={chartH - p*chartH + 4} textAnchor="end" fontSize="9" fill="#8898aa">{Math.round(p*max)}</text>
        </g>
      ))}
      {bars.map((b, i) => {
        const barH = (b.value/max)*chartH;
        const x = padL + i*(barW+gap);
        return (
          <g key={b.label}>
            <rect x={x} y={chartH-barH} width={barW} height={barH} fill={b.color} rx="5" opacity="0.9"/>
            <rect x={x} y={chartH-barH} width={barW} height={Math.min(barH,8)} fill={b.color} rx="5"/>
            <text x={x+barW/2} y={chartH-barH-7} textAnchor="middle" fontSize="11" fontWeight="700" fill={b.color}>{b.value}</text>
            <text x={x+barW/2} y={chartH+16} textAnchor="middle" fontSize="10" fill="#4a5568">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Home() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5000/api/sentiment');
      if (!res.ok) throw new Error('Failed');
      setData(await res.json());
    } catch {
      setError('Cannot connect to backend. Make sure server.py is running.');
    } finally {
      setLoading(false);
    }
  };

  const pos   = data ? data.filter(d => d.sentiment === 'POSITIVE') : [];
  const neg   = data ? data.filter(d => d.sentiment === 'NEGATIVE') : [];
  const neu   = data ? data.filter(d => d.sentiment === 'NEUTRAL')  : [];
  const total = data ? data.length : 0;
  const posP  = total ? ((pos.length/total)*100).toFixed(1) : 0;
  const negP  = total ? ((neg.length/total)*100).toFixed(1) : 0;
  const neuP  = total ? ((neu.length/total)*100).toFixed(1) : 0;

  const sources     = data ? [...new Set(data.map(d => d.source))] : [];
  const top5pos     = [...pos].sort((a,b) => b.score - a.score).slice(0,5);
  const top5neg     = [...neg].sort((a,b) => a.score - b.score).slice(0,5);
  const sourceStats = sources.map(s => {
    const src = data.filter(d => d.source === s);
    return {
      name:  s,
      total: src.length,
      pos:   src.filter(d => d.sentiment === 'POSITIVE').length,
      neg:   src.filter(d => d.sentiment === 'NEGATIVE').length,
      neu:   src.filter(d => d.sentiment === 'NEUTRAL').length,
      ...PLATFORM_META[s],
    };
  });

  // Section heading component
  const SectionLabel = ({ text }) => (
    <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: '#e8640c', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 20, height: 3, background: '#e8640c', borderRadius: 2, display: 'inline-block' }} />{text}
    </div>
  );

  return (
    <div style={{ background: '#f0f2f8', minHeight: '100vh' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2040 60%, #0a1628 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative glow */}
        <div style={{ position: 'absolute', top: -80, left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,100,12,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 80px', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>

          {/* Left — headline + CTA */}
          <div style={{ maxWidth: 580 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,100,12,0.15)', border: '1px solid rgba(232,100,12,0.35)', color: '#e8640c', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, padding: '6px 14px', borderRadius: 6, marginBottom: 22 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e8640c', animation: 'blink 2s infinite', display: 'inline-block' }} />
              Social Media Sentiment Analyser
            </div>
            <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: 'white', marginBottom: 16, lineHeight: 1.1 }}>
              Public Perception of<br /><span style={{ color: '#e8640c' }}>BPIT College</span>
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 480, marginBottom: 34 }}>
              Aggregated from Reddit, Shiksha, Careers360, YouTube and Collegedunia — analysed using a 3-layer NLP pipeline. Visit each platform page to run analysis, then load the dashboard below.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <button onClick={loadDashboard} disabled={loading} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: loading ? 'rgba(255,255,255,0.1)' : '#e8640c',
                color: 'white', border: `2px solid ${loading ? 'rgba(255,255,255,0.2)' : '#e8640c'}`,
                padding: '13px 32px', borderRadius: 10,
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.05rem',
                letterSpacing: '0.5px', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(232,100,12,0.45)',
                transition: 'all 0.2s',
              }}>
                {loading
                  ? <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Loading...</>
                  : <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/>
                        <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.7"/>
                        <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.7"/>
                        <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.5"/>
                      </svg>
                      Load Dashboard
                    </>
                }
              </button>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.32)', margin: 0, maxWidth: 240 }}>
                Run analysis on each platform first, then load the dashboard.
              </p>
            </div>

            {error && (
              <div style={{ marginTop: 18, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '10px 16px', fontSize: '0.82rem', color: '#fca5a5' }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Right — platform quick links with real logos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 6 }}>Go to Platform</p>
            {Object.entries(PLATFORM_META).map(([name, meta]) => (
              <Link key={name} href={meta.href} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '11px 16px', textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${meta.color}18`; e.currentTarget.style.borderColor = `${meta.color}50`; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                {/* Real logo */}
                <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {PLATFORM_LOGOS[name]}
                </div>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: 'rgba(255,255,255,0.82)', flex: 1 }}>{name}</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD DATA ────────────────────────────────────── */}
      {data && !loading && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '44px 80px 80px' }}>

          {/* STATS STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Reviews', value: total,      accent: '#e8640c', pct: 'Across all platforms' },
              { label: 'Positive',      value: pos.length, accent: '#16a34a', pct: `${posP}% of total` },
              { label: 'Negative',      value: neg.length, accent: '#dc2626', pct: `${negP}% of total` },
              { label: 'Neutral',       value: neu.length, accent: '#d97706', pct: `${neuP}% of total` },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', border: '1.5px solid #dde3ef', borderRadius: 16, padding: '22px 24px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.accent, borderRadius: '16px 16px 0 0' }} />
                <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#8898aa', marginBottom: 10 }}>{s.label}</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.6rem', fontWeight: 700, lineHeight: 1, color: s.accent }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#8898aa', marginTop: 6 }}>{s.pct}</div>
              </div>
            ))}
          </div>

          {/* CHARTS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            {[
              { title: 'Overall Distribution', content: <PieChart pos={pos.length} neg={neg.length} neu={neu.length} total={total} /> },
              { title: 'Overall Count',        content: <BarChart pos={pos.length} neg={neg.length} neu={neu.length} /> },
            ].map(card => (
              <div key={card.title} style={{ background: 'white', border: '1.5px solid #dde3ef', borderRadius: 16, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <SectionLabel text={card.title} />
                <div style={{ marginTop: 16 }}>{card.content}</div>
              </div>
            ))}
          </div>

          {/* OVERALL SENTIMENT BAR */}
          <div style={{ background: 'white', border: '1.5px solid #dde3ef', borderRadius: 16, padding: 28, marginBottom: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <SectionLabel text="Overall Sentiment" />
            <div style={{ height: 13, borderRadius: 7, overflow: 'hidden', display: 'flex', gap: 2, marginTop: 16, marginBottom: 14 }}>
              <div style={{ width: `${posP}%`, background: 'linear-gradient(90deg,#16a34a,#22c55e)', transition: 'width 1s ease', boxShadow: '0 2px 8px #16a34a40' }} />
              <div style={{ width: `${neuP}%`, background: '#d97706' }} />
              <div style={{ width: `${negP}%`, background: '#dc2626' }} />
            </div>
            <div style={{ display: 'flex', gap: 28 }}>
              {[
                { label: 'Positive', pct: posP, color: '#16a34a' },
                { label: 'Neutral',  pct: neuP, color: '#d97706' },
                { label: 'Negative', pct: negP, color: '#dc2626' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, boxShadow: `0 2px 6px ${s.color}50` }} />
                  <span style={{ fontSize: '0.82rem', color: '#4a5568' }}>{s.label}</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: s.color }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* PLATFORM CARDS */}
          <div style={{ marginBottom: 20 }}>
            <SectionLabel text="Platform Breakdown" />
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.7rem', fontWeight: 700, color: '#0a1628', marginTop: 6, marginBottom: 20 }}>Analysis by Source</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 44 }}>
            {sourceStats.map(s => {
              const p2 = s.total ? ((s.pos/s.total)*100).toFixed(0) : 0;
              const n2 = s.total ? ((s.neg/s.total)*100).toFixed(0) : 0;
              const u2 = s.total ? ((s.neu/s.total)*100).toFixed(0) : 0;
              return (
                <Link key={s.name} href={s.href || '#'} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', border: '1.5px solid #dde3ef', borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.22s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${s.color}22`; e.currentTarget.style.borderColor = `${s.color}40`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#dde3ef'; }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.color, borderRadius: '16px 16px 0 0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Real platform logo */}
                        <div style={{ width: 44, height: 44, borderRadius: 11, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f8' }}>
                          {PLATFORM_LOGOS[s.name]}
                        </div>
                        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.05rem', fontWeight: 700, color: '#0a1628' }}>{s.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.total}</div>
                        <div style={{ fontSize: '0.62rem', color: '#8898aa', textTransform: 'uppercase', letterSpacing: 1 }}>Reviews</div>
                      </div>
                    </div>

                    {/* Mini sentiment bar */}
                    <div style={{ height: 7, borderRadius: 4, overflow: 'hidden', display: 'flex', gap: 1, marginBottom: 12 }}>
                      <div style={{ width: `${p2}%`, background: '#16a34a' }} />
                      <div style={{ width: `${u2}%`, background: '#d97706' }} />
                      <div style={{ width: `${n2}%`, background: '#dc2626' }} />
                    </div>

                    <div style={{ display: 'flex', gap: 14 }}>
                      {[{l:'Pos',v:p2,c:'#16a34a'},{l:'Neu',v:u2,c:'#d97706'},{l:'Neg',v:n2,c:'#dc2626'}].map(x => (
                        <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c, boxShadow: `0 1px 4px ${x.c}50` }} />
                          <span style={{ fontSize: '0.72rem', color: '#4a5568' }}>{x.l}</span>
                          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.76rem', color: x.c }}>{x.v}%</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: s.color, fontWeight: 600, fontFamily: 'Rajdhani, sans-serif' }}>
                      View Full Analysis <span>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* TOP REVIEWS */}
          <div style={{ marginBottom: 20 }}>
            <SectionLabel text="Highlights" />
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.7rem', fontWeight: 700, color: '#0a1628', marginTop: 6, marginBottom: 20 }}>Top Reviews</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { items: top5pos, color: '#16a34a', bg: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.2)',  label: 'Top 5 Positive',        rankLabel: 'Most Positive' },
              { items: top5neg, color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)',  label: 'Top 5 Brutal Negative', rankLabel: 'Most Negative' },
            ].map(col => (
              <div key={col.label} style={{ background: 'white', border: `1.5px solid ${col.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${col.border}`, background: col.bg, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.color, boxShadow: `0 2px 6px ${col.color}60` }} />
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#0a1628' }}>{col.label}</div>
                </div>
                {col.items.length === 0
                  ? <div style={{ padding: 24, color: '#8898aa', fontSize: '0.85rem' }}>No reviews found.</div>
                  : col.items.map((item, i) => (
                    <div key={i} style={{ padding: '14px 24px', borderBottom: i < col.items.length-1 ? '1px solid rgba(0,0,0,0.04)' : 'none', transition: 'background 0.15s', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f7f9fc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: col.bg, border: `1px solid ${col.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.72rem', color: col.color, flexShrink: 0 }}>{i+1}</div>
                        <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: col.color }}>{col.rankLabel}</div>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#4a5568', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.text}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}>
                        <span style={{ background: col.bg, color: col.color, border: `1px solid ${col.border}`, fontSize: '0.68rem', fontWeight: 700, padding: '2px 9px', borderRadius: 5, fontFamily: 'Rajdhani, sans-serif' }}>{item.score?.toFixed(3)}</span>
                        <span style={{ fontSize: '0.68rem', color: '#8898aa', fontWeight: 500 }}>{item.source}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg) } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}