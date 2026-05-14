'use client';
import { useState, useEffect, useRef } from 'react';

const SENTIMENT_COLOR  = { POSITIVE: '#16a34a', NEGATIVE: '#dc2626', NEUTRAL: '#d97706' };
const SENTIMENT_BG     = { POSITIVE: 'rgba(22,163,74,0.10)', NEGATIVE: 'rgba(220,38,38,0.10)', NEUTRAL: 'rgba(217,119,6,0.10)' };
const SENTIMENT_BORDER = { POSITIVE: 'rgba(22,163,74,0.25)', NEGATIVE: 'rgba(220,38,38,0.25)', NEUTRAL: 'rgba(217,119,6,0.25)' };
const SENTIMENT_ICON   = { POSITIVE: '↑', NEGATIVE: '↓', NEUTRAL: '→' };

// Real SVG platform logos
const PLATFORM_LOGO = {
  Reddit: (
    <svg width="36" height="36" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#FF4500"/>
      <path d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.16.16 0 00-.19.12l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.47-1.5z" fill="white"/>
      <circle cx="8.18" cy="11.06" r=".9" fill="#FF4500"/>
      <circle cx="11.82" cy="11.06" r=".9" fill="#FF4500"/>
      <path d="M12.57 13a3.3 3.3 0 01-2.57.9 3.3 3.3 0 01-2.57-.9.16.16 0 00-.22.22 3.6 3.6 0 002.79 1 3.6 3.6 0 002.79-1 .16.16 0 00-.22-.22z" fill="#FF4500"/>
    </svg>
  ),
  Shiksha: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#00897B"/>
      <path d="M18 30 C14 30 10.5 25.5 10.5 20 C10.5 14.5 14 10 18 8 C22 10 25.5 14.5 25.5 20 C25.5 25.5 22 30 18 30 Z" fill="white"/>
      <path d="M18 27 C15.5 27 13.5 24 13.5 20 C13.5 16.5 15.5 13.5 18 12 C20.5 13.5 22.5 16.5 22.5 20 C22.5 24 20.5 27 18 27 Z" fill="#00897B"/>
      <ellipse cx="18" cy="12" rx="5" ry="1.5" fill="#E6A817"/>
      <rect x="11" y="9" width="14" height="2.5" rx="1.2" fill="white"/>
      <polygon points="18,5 10,9 26,9" fill="white"/>
    </svg>
  ),
  Careers360: (
    // Purple circle with white C cutout and small dot — matches actual Careers360 logo
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="18" fill="#5C6BC0"/>
      {/* Big C shape: full circle minus a gap on the right */}
      <circle cx="18" cy="19" r="9" fill="white"/>
      <circle cx="18" cy="19" r="6" fill="#5C6BC0"/>
      {/* Gap to make it a C — white wedge on right */}
      <rect x="21" y="15" width="8" height="8" fill="#5C6BC0"/>
      {/* Small circle dot top-right */}
      <circle cx="25" cy="11" r="3.5" fill="white"/>
    </svg>
  ),
  YouTube: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#FF0000"/>
      <path d="M29.7 11.8a3.15 3.15 0 00-2.22-2.23C25.56 9 18 9 18 9s-7.56 0-9.48.57A3.15 3.15 0 006.3 11.8 33 33 0 005.84 18a33 33 0 00.56 6.2 3.15 3.15 0 002.22 2.23C10.44 27 18 27 18 27s7.56 0 9.48-.57a3.15 3.15 0 002.22-2.23A33 33 0 0030.16 18a33 33 0 00-.56-6.2z" fill="white"/>
      <polygon points="15,22.5 22.5,18 15,13.5" fill="#FF0000"/>
    </svg>
  ),
  Collegedunia: (
    // Dark bg with cartoon face + glasses — matches actual Collegedunia logo
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#1a1a2e"/>
      {/* Head shape */}
      <ellipse cx="18" cy="17" rx="9" ry="10" fill="#e8c9a0"/>
      {/* Hair */}
      <ellipse cx="18" cy="9" rx="9" ry="5" fill="#2d1b00"/>
      <ellipse cx="13" cy="10" rx="3" ry="4" fill="#2d1b00"/>
      {/* Small horn/spike on left */}
      <ellipse cx="12" cy="8" rx="1.5" ry="3" fill="#cc0000" transform="rotate(-15 12 8)"/>
      {/* Eyes with glasses */}
      <circle cx="14.5" cy="18" r="3.5" fill="white" stroke="#333" strokeWidth="1.2"/>
      <circle cx="21.5" cy="18" r="3.5" fill="white" stroke="#333" strokeWidth="1.2"/>
      {/* Glasses bridge */}
      <line x1="18" y1="18" x2="18" y2="18" stroke="#333" strokeWidth="1.2"/>
      <path d="M18 18 h0" stroke="#333" strokeWidth="1.2"/>
      <rect x="17.5" y="17.5" width="1" height="1" fill="#333"/>
      {/* Pupils */}
      <circle cx="14.5" cy="18.5" r="1.5" fill="#333"/>
      <circle cx="21.5" cy="18.5" r="1.5" fill="#333"/>
      {/* Glasses frames thick */}
      <circle cx="14.5" cy="18" r="3.5" fill="none" stroke="#222" strokeWidth="1.5"/>
      <circle cx="21.5" cy="18" r="3.5" fill="none" stroke="#222" strokeWidth="1.5"/>
      {/* Glasses bridge */}
      <line x1="18" y1="18" x2="18" y2="18" stroke="#222" strokeWidth="1.5"/>
      <path d="M11 18 Q11 15 13 15" stroke="#222" strokeWidth="1.2" fill="none"/>
      <path d="M25 18 Q25 15 23 15" stroke="#222" strokeWidth="1.2" fill="none"/>
      {/* Mouth */}
      <path d="M15 22 Q18 24 21 22" stroke="#333" strokeWidth="1" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  Quora: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#B92B27"/>
      <text x="18" y="26" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white" fontFamily="serif">Q</text>
    </svg>
  ),
};

// Per-platform brand colors (matched to real logos)
const PLATFORM_BRAND = {
  Reddit:       '#FF4500',
  Shiksha:      '#00897B',
  Careers360:   '#5C6BC0',
  YouTube:      '#FF0000',
  Collegedunia: '#1a1a2e',
  Quora:        '#B92B27',
};

function buildSourceLink(link, source) {
  if (!link) return link;
  const src = source.toLowerCase();
  if (src === 'shiksha')      return link + '#reviews-section';
  if (src === 'careers360')   return link + '#reviews';
  if (src === 'collegedunia') return link + '#reviews';
  return link;
}

function PieChart({ pos, neg, neu, total }) {
  if (!total) return <div style={{ textAlign: 'center', color: '#8898aa', fontSize: '0.85rem', padding: 40 }}>No data</div>;
  const slices = [
    { pct: pos/total, color: '#16a34a', label: 'Positive' },
    { pct: neg/total, color: '#dc2626', label: 'Negative' },
    { pct: neu/total, color: '#d97706', label: 'Neutral'  },
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
            <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0, boxShadow: `0 2px 6px ${s.color}60` }} />
            <span style={{ fontSize: '0.83rem', color: '#4a5568', fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: s.color }}>{(s.pct * 100).toFixed(1)}%</span>
            <span style={{ fontSize: '0.75rem', color: '#8898aa' }}>({s.label === 'Positive' ? pos : s.label === 'Negative' ? neg : neu})</span>
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
          <line x1={padL} y1={chartH - p * chartH} x2={padL + bars.length * (barW + gap)} y2={chartH - p * chartH} stroke="#dde3ef" strokeWidth="1" />
          <text x={padL - 4} y={chartH - p * chartH + 4} textAnchor="end" fontSize="9" fill="#8898aa">{Math.round(p * max)}</text>
        </g>
      ))}
      {bars.map((b, i) => {
        const barH = (b.value / max) * chartH;
        const x = padL + i * (barW + gap);
        return (
          <g key={b.label}>
            <rect x={x} y={chartH - barH} width={barW} height={barH} fill={b.color} rx="5" opacity="0.9"/>
            <rect x={x} y={chartH - barH} width={barW} height={Math.min(barH, 8)} fill={b.color} rx="5"/>
            <text x={x + barW / 2} y={chartH - barH - 7} textAnchor="middle" fontSize="11" fontWeight="700" fill={b.color}>{b.value}</text>
            <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize="10" fill="#4a5568">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ReviewDropdown({ label, count, color, bg, border, items, onSelect, source }) {
  const [open, setOpen] = useState(false);
  const icon = label === 'Positive' ? '↑' : label === 'Negative' ? '↓' : '→';

  return (
    <div style={{ border: `1.5px solid ${border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12, boxShadow: open ? `0 4px 20px ${color}18` : 'none', transition: 'box-shadow 0.2s' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: open ? bg : 'white', cursor: 'pointer', userSelect: 'none', transition: 'background 0.2s' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.1rem', fontWeight: 700, boxShadow: `0 3px 10px ${color}50` }}>{icon}</div>
          <div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#0a1628' }}>{label} Reviews</div>
            <div style={{ fontSize: '0.72rem', color: '#8898aa', marginTop: 1 }}>{count} reviews found</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: color, color: 'white', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', padding: '3px 12px', borderRadius: 20, boxShadow: `0 2px 8px ${color}50` }}>{count}</span>
          <span style={{ color, fontSize: '1.1rem', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
        </div>
      </div>

      {open && (
        <div style={{ background: 'white' }}>
          {items.length === 0 ? (
            <div style={{ padding: '20px 24px', color: '#8898aa', fontSize: '0.85rem' }}>No reviews found.</div>
          ) : (
            items.map((item, i) => (
              <div
                key={i}
                onClick={() => onSelect(item)}
                style={{ padding: '14px 20px', borderTop: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f7f9fc'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <div style={{ width: 26, height: 26, borderRadius: 6, background: bg, border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.78rem', color, flexShrink: 0, marginTop: 2 }}>{i+1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.83rem', color: '#2d3748', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.text}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <span style={{ background: bg, color, border: `1px solid ${border}`, fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 5, fontFamily: 'Rajdhani, sans-serif' }}>{icon} {Math.abs(item.score)?.toFixed(3)}</span>
                    {item.link && <a href={buildSourceLink(item.link, source)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '0.68rem', color: '#8898aa', textDecoration: 'none' }}>View Source ↗</a>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function PlatformPage({ source, icon, color }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [running, setRunning] = useState(false);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All');
  const [modal,   setModal]   = useState(null);
  const [runMsg,  setRunMsg]  = useState('');
  const resultsRef = useRef(null);

  // Use brand color if available, else fallback to passed color
  const brandColor = PLATFORM_BRAND[source] || color;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/sentiment/${source.toLowerCase()}`);
      if (!res.ok) throw new Error('Failed');
      setData(await res.json());
      setError(null);
    } catch { setError('Cannot connect to backend. Run: python server.py'); }
    finally  { setLoading(false); }
  };

  const runAnalysis = async () => {
    try {
      setRunning(true);
      setRunMsg('Scraping and analysing...');
      const res  = await fetch(`http://localhost:5000/api/run/${source.toLowerCase()}`);
      const json = await res.json();
      if (json.error) { setRunMsg('Error: ' + json.error); return; }
      setData(json);
      setRunMsg(`✅ Done! ${json.length} reviews analysed.`);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch { setRunMsg('❌ Failed. Is server.py running?'); }
    finally  { setRunning(false); }
  };

  useEffect(() => { fetchData(); }, [source]);

  const filtered = data.filter(d =>
    (filter === 'All' || d.sentiment === filter) &&
    d.text?.toLowerCase().includes(search.toLowerCase())
  );

  const pos   = data.filter(d => d.sentiment === 'POSITIVE');
  const neg   = data.filter(d => d.sentiment === 'NEGATIVE');
  const neu   = data.filter(d => d.sentiment === 'NEUTRAL');
  const total = data.length;
  const posP  = total ? ((pos.length/total)*100).toFixed(1) : 0;
  const negP  = total ? ((neg.length/total)*100).toFixed(1) : 0;
  const neuP  = total ? ((neu.length/total)*100).toFixed(1) : 0;

  const posSorted = [...pos].sort((a,b) => b.score - a.score);
  const negSorted = [...neg].sort((a,b) => a.score - b.score);
  const neuSorted = [...neu];

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 44, height: 44, border: '3px solid #dde3ef', borderTop: `3px solid ${brandColor}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', color: '#8898aa', letterSpacing: 1 }}>LOADING {source.toUpperCase()}...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: '0 40px' }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <p style={{ color: '#8898aa' }}>{error}</p>
      <button onClick={fetchData} style={{ background: brandColor, color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
    </div>
  );

  return (
    <div style={{ background: '#f0f2f8', minHeight: '100vh' }}>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2040 60%, #0a1628 100%)', padding: '52px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative glow behind logo */}
        <div style={{ position: 'absolute', top: -60, right: 120, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${brandColor}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              {/* Real platform logo */}
              <div style={{ width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', border: `2px solid ${brandColor}40`, boxShadow: `0 0 24px ${brandColor}40` }}>
                {PLATFORM_LOGO[source] || <span style={{ fontSize: 28 }}>{icon}</span>}
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 3 }}>Platform Analysis</div>
                <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.1rem', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1 }}>
                  {source} <span style={{ color: brandColor }}>Reviews</span>
                </h1>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', maxWidth: 480, lineHeight: 1.7, margin: '0 0 22px' }}>
              {total > 0 ? `Showing ${total} reviews from ${source} about BPIT.` : `No data yet for ${source}. Hit Analyse to scrape and analyse reviews.`}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button onClick={runAnalysis} disabled={running} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: running ? 'rgba(255,255,255,0.1)' : brandColor,
                color: 'white', border: `2px solid ${running ? 'rgba(255,255,255,0.2)' : brandColor}`,
                padding: '12px 28px', borderRadius: 10,
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem',
                letterSpacing: '0.5px', cursor: running ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: running ? 'none' : `0 4px 16px ${brandColor}50`,
              }}>
                {running
                  ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Analysing {source}...</>
                  : <>▶ Analyse {source}</>}
              </button>
              {runMsg && <div style={{ fontSize: '0.82rem', color: runMsg.startsWith('✅') ? '#4ade80' : runMsg.startsWith('❌') ? '#f87171' : 'rgba(255,255,255,0.6)', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{runMsg}</div>}
            </div>
          </div>

          {/* Donut chart in hero */}
          {total > 0 && (
            <div style={{ position: 'relative', width: 148, height: 148, flexShrink: 0 }}>
              <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 16px ${brandColor}40)` }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="13" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#dc2626" strokeWidth="13" strokeDasharray={`${(neg.length/(total||1))*314} 314`} strokeLinecap="round" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#d97706" strokeWidth="13" strokeDasharray={`${(neu.length/(total||1))*314} 314`} strokeDashoffset={`-${(neg.length/(total||1))*314}`} strokeLinecap="round" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#16a34a" strokeWidth="13" strokeDasharray={`${(pos.length/(total||1))*314} 314`} strokeDashoffset={`-${((neg.length+neu.length)/(total||1))*314}`} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.9rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>{posP}<span style={{ color: brandColor, fontSize: '1rem' }}>%</span></div>
                <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>Positive</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {total > 0 && (
        <div ref={resultsRef} style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 80px 80px' }}>

          {/* STATS STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Reviews', value: total,      accent: brandColor,  pct: `From ${source}` },
              { label: 'Positive',      value: pos.length, accent: '#16a34a',   pct: `${posP}% of total` },
              { label: 'Negative',      value: neg.length, accent: '#dc2626',   pct: `${negP}% of total` },
              { label: 'Neutral',       value: neu.length, accent: '#d97706',   pct: `${neuP}% of total` },
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
              { title: 'Sentiment Distribution', content: <PieChart pos={pos.length} neg={neg.length} neu={neu.length} total={total} /> },
              { title: 'Sentiment Count',        content: <BarChart pos={pos.length} neg={neg.length} neu={neu.length} /> },
            ].map(card => (
              <div key={card.title} style={{ background: 'white', border: '1.5px solid #dde3ef', borderRadius: 16, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: brandColor, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 3, background: brandColor, borderRadius: 2, display: 'inline-block' }} />{card.title}
                </div>
                {card.content}
              </div>
            ))}
          </div>

          {/* HORIZONTAL BREAKDOWN */}
          <div style={{ background: 'white', border: '1.5px solid #dde3ef', borderRadius: 16, padding: 28, marginBottom: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: brandColor, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 20, height: 3, background: brandColor, borderRadius: 2, display: 'inline-block' }} />Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { label: 'Positive', count: pos.length, pct: posP, color: '#16a34a' },
                { label: 'Neutral',  count: neu.length, pct: neuP, color: '#d97706' },
                { label: 'Negative', count: neg.length, pct: negP, color: '#dc2626' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, boxShadow: `0 2px 6px ${s.color}60` }} />
                      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: '#0a1628' }}>{s.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.92rem', color: s.color }}>{s.pct}%</span>
                      <span style={{ fontSize: '0.8rem', color: '#8898aa' }}>{s.count} reviews</span>
                    </div>
                  </div>
                  <div style={{ height: 11, background: '#f0f2f8', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.pct}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)`, borderRadius: 6, transition: 'width 1s ease', boxShadow: `0 2px 8px ${s.color}40` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DROPDOWN REVIEW SECTIONS */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: brandColor, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 20, height: 3, background: brandColor, borderRadius: 2, display: 'inline-block' }} />Reviews by Sentiment
            </div>
            <ReviewDropdown label="Positive" count={pos.length} color="#16a34a" bg="rgba(22,163,74,0.07)"  border="rgba(22,163,74,0.25)"  items={posSorted} onSelect={setModal} source={source} />
            <ReviewDropdown label="Negative" count={neg.length} color="#dc2626" bg="rgba(220,38,38,0.07)"  border="rgba(220,38,38,0.25)"  items={negSorted} onSelect={setModal} source={source} />
            <ReviewDropdown label="Neutral"  count={neu.length} color="#d97706" bg="rgba(217,119,6,0.07)"  border="rgba(217,119,6,0.25)"  items={neuSorted} onSelect={setModal} source={source} />
          </div>

          {/* ALL REVIEWS TABLE */}
          <div style={{ background: 'white', border: '1.5px solid #dde3ef', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #dde3ef', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: brandColor, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 20, height: 3, background: brandColor, borderRadius: 2, display: 'inline-block' }} />All Reviews
              </div>
              <input
                style={{ flex: 1, minWidth: 200, background: '#f0f2f8', border: '1.5px solid #dde3ef', borderRadius: 8, padding: '8px 14px', fontFamily: 'Hind, sans-serif', fontSize: '0.85rem', color: '#1a2340', outline: 'none' }}
                placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                {['All', 'POSITIVE', 'NEGATIVE', 'NEUTRAL'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '6px 14px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 600,
                    fontFamily: 'Rajdhani, sans-serif', border: '1.5px solid transparent', cursor: 'pointer',
                    background: filter === f
                      ? (f === 'POSITIVE' ? '#16a34a' : f === 'NEGATIVE' ? '#dc2626' : f === 'NEUTRAL' ? '#d97706' : '#0a1628')
                      : 'transparent',
                    color: filter === f ? 'white' : '#4a5568',
                    borderColor: filter === f
                      ? (f === 'POSITIVE' ? '#16a34a' : f === 'NEGATIVE' ? '#dc2626' : f === 'NEUTRAL' ? '#d97706' : '#0a1628')
                      : '#dde3ef',
                    boxShadow: filter === f ? `0 2px 8px ${f === 'POSITIVE' ? '#16a34a' : f === 'NEGATIVE' ? '#dc2626' : f === 'NEUTRAL' ? '#d97706' : '#0a1628'}40` : 'none',
                    transition: 'all 0.15s',
                  }}>{f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}</button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ background: '#f0f2f8' }}>
                    {['#', 'Review', 'Sentiment', 'Score'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#8898aa', padding: '12px 20px', borderBottom: '1px solid #dde3ef' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <tr key={i} onClick={() => setModal(item)} style={{ cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.04)', borderLeft: `3px solid ${SENTIMENT_COLOR[item.sentiment]}` }}
                      onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = '#f7f9fc')}
                      onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = 'white')}>
                      <td style={{ padding: '12px 20px', fontSize: '0.75rem', color: '#8898aa', width: 40 }}>{i+1}</td>
                      <td style={{ padding: '12px 20px', maxWidth: 500 }}>
                        <div style={{ fontSize: '0.82rem', color: '#2d3748', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.55 }}>{item.text}</div>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif', background: SENTIMENT_BG[item.sentiment], color: SENTIMENT_COLOR[item.sentiment], border: `1.5px solid ${SENTIMENT_BORDER[item.sentiment]}`, boxShadow: `0 1px 4px ${SENTIMENT_COLOR[item.sentiment]}25` }}>
                          {SENTIMENT_ICON[item.sentiment]} {item.sentiment}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: SENTIMENT_COLOR[item.sentiment] }}>{item.score?.toFixed(4)}</div>
                        <div style={{ marginTop: 4, height: 4, background: '#f0f2f8', borderRadius: 2, overflow: 'hidden', width: 70 }}>
                          <div style={{ height: '100%', borderRadius: 2, width: `${Math.abs(item.score)*100}%`, background: SENTIMENT_COLOR[item.sentiment], boxShadow: `0 0 4px ${SENTIMENT_COLOR[item.sentiment]}60` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#8898aa', fontSize: '0.85rem' }}>No reviews found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {total === 0 && !loading && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${brandColor}15`, border: `2px solid ${brandColor}30` }}>
            {PLATFORM_LOGO[source] || <span style={{ fontSize: 36 }}>{icon}</span>}
          </div>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.6rem', color: '#0a1628', marginBottom: 8 }}>No data for {source} yet</h2>
          <p style={{ color: '#8898aa', marginBottom: 24 }}>Click the Analyse button above to scrape and analyse {source} reviews.</p>
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div onClick={e => e.target === e.currentTarget && setModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.65)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 18, padding: 36, maxWidth: 540, width: '100%', position: 'relative', boxShadow: '0 32px 80px rgba(10,22,40,0.25)', borderTop: `4px solid ${SENTIMENT_COLOR[modal.sentiment]}` }}>
            <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: '#f0f2f8', border: '1.5px solid #dde3ef', color: '#4a5568', width: 32, height: 32, borderRadius: 8, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: '0.72rem', color: '#8898aa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{source} · Full Review</div>
            <p style={{ fontSize: '0.92rem', color: '#2d3748', lineHeight: 1.8 }}>{modal.text}</p>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif', background: SENTIMENT_BG[modal.sentiment], color: SENTIMENT_COLOR[modal.sentiment], border: `1.5px solid ${SENTIMENT_BORDER[modal.sentiment]}`, boxShadow: `0 2px 8px ${SENTIMENT_COLOR[modal.sentiment]}30` }}>
                {SENTIMENT_ICON[modal.sentiment]} {modal.sentiment} · {modal.score?.toFixed(4)}
              </span>
              {modal.link && <a href={buildSourceLink(modal.link, source)} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: brandColor, textDecoration: 'underline' }}>View Source ↗</a>}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}