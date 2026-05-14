'use client';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: '#0d1b2e', color: 'white', fontFamily: 'Hind, sans-serif' }}>

      {/* Top accent line */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #e8640c 0%, #f0a500 50%, #e8640c 100%)' }} />

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 48px 40px', display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: 40 }}>

        {/* Brand col */}
        <div>
          {/* Logo text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
           <img src="/logo.png" alt="BPIT Logo" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(232,100,12,0.3)', boxShadow: '0 2px 10px rgba(232,100,12,0.2)' }} />
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.5px' }}>
              BP<span style={{ color: '#e8640c' }}>IT</span> Pulse
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.85, maxWidth: 260, marginBottom: 28 }}>
            A real-time sentiment analysis dashboard tracking public perception of Bhagwan Parshuram Institute of Technology across the internet.
          </p>

          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {[
              { icon: '📍', text: 'Rohini, New Delhi — 110085' },
              { icon: '🌐', text: 'www.bpitindia.com',          href: 'https://bpitindia.com' },
              { icon: '✉️', text: 'info@bpitindia.com',         href: 'mailto:info@bpitindia.com' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, flexShrink: 0 }}>{item.icon}</span>
                {item.href
                  ? <a href={item.href} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}>{item.text}</a>
                  : <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)' }}>{item.text}</span>
                }
              </div>
            ))}
          </div>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'f',  href: 'https://facebook.com/bpitindia',        color: '#1877F2', title: 'Facebook'  },
              { label: '𝕏',  href: 'https://twitter.com/bpitindia',         color: '#14171A', title: 'X/Twitter' },
              { label: 'in', href: 'https://linkedin.com/school/bpitindia', color: '#0A66C2', title: 'LinkedIn'  },
              { label: '▶',  href: 'https://youtube.com/@bpitindia',        color: '#FF0000', title: 'YouTube'   },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.title}
                style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = s.color; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = s.color; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div>
          <h4 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#e8640c', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            Data Sources
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Reddit',      href: '/reddit'       },
              { label: 'Shiksha',     href: '/shiksha'      },
              { label: 'Careers360',  href: '/careers360'   },
              { label: 'YouTube',     href: '/youtube'      },
              { label: 'Collegedunia',href: '/collegedunia' },
            ].map(s => (
              <li key={s.label}>
                <a href={s.href} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, transition: 'color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.querySelector('span').style.color = '#e8640c'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.42)'; e.currentTarget.querySelector('span').style.color = 'rgba(232,100,12,0.6)'; }}>
                  <span style={{ color: 'rgba(232,100,12,0.6)', fontSize: 13, transition: 'color 0.2s' }}>›</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Analysis */}
        <div>
          <h4 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#e8640c', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            Analysis
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Sentiment Overview', 'Positive Reviews', 'Negative Reviews', 'Platform Breakdown', 'Score Metrics'].map(s => (
              <li key={s}>
                <a href="#" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, transition: 'color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.querySelector('span').style.color = '#e8640c'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.42)'; e.currentTarget.querySelector('span').style.color = 'rgba(232,100,12,0.6)'; }}>
                  <span style={{ color: 'rgba(232,100,12,0.6)', fontSize: 13, transition: 'color 0.2s' }}>›</span>
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech Stack */}
        <div>
          <h4 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#e8640c', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            Tech Stack
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Python 3.x', 'VADER NLP', 'XLM-RoBERTa', 'Next.js 14', 'Flask API', 'MongoDB Atlas'].map(s => (
              <li key={s}>
                <a href="#" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, transition: 'color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.querySelector('span').style.color = '#e8640c'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.42)'; e.currentTarget.querySelector('span').style.color = 'rgba(232,100,12,0.6)'; }}>
                  <span style={{ color: 'rgba(232,100,12,0.6)', fontSize: 13, transition: 'color 0.2s' }}>›</span>
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 48px' }} />

      {/* Bottom bar */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.28)', margin: 0 }}>
          © {year} <span style={{ color: '#e8640c' }}>BPIT Pulse</span> · Made with ❤️ in Delhi · For students, by students
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Python', 'VADER', 'Next.js', 'MongoDB'].map(t => (
            <span key={t} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 600, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

    </footer>
  );
}