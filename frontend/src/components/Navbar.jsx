import { RefreshCw } from 'lucide-react';

export default function Navbar({ onRefresh, refreshing, lastUpdated }) {
  return (
    <nav style={{
      height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px',
      background: '#161616',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'linear-gradient(135deg, #C0392B, #8B0000)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'DM Sans', sans-serif",
          flexShrink: 0,
        }}>D</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.01em', color: '#F0F0F0', fontFamily: "'DM Sans', sans-serif" }}>
            DigiBug <span style={{ color: '#909090', fontWeight: 400 }}>Ads</span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 4 }}>
        {['Dashboard', 'Reports', 'Settings'].map((item, i) => (
          <span key={item} style={{
            padding: '6px 14px', borderRadius: 6,
            fontSize: 13, fontWeight: 500,
            color: i === 0 ? '#F0F0F0' : '#555555',
            background: i === 0 ? 'rgba(255,255,255,0.06)' : 'transparent',
            cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => { if (i !== 0) { e.target.style.color = '#909090'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}}
          onMouseLeave={e => { if (i !== 0) { e.target.style.color = '#555555'; e.target.style.background = 'transparent'; }}}
          >{item}</span>
        ))}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {lastUpdated && (
          <span style={{ fontSize: 11, color: '#555', fontFamily: "'DM Mono', monospace" }}>
            {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
        <button onClick={onRefresh} disabled={refreshing} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: refreshing ? 'rgba(192,57,43,0.12)' : '#C0392B',
          border: 'none', color: '#fff', borderRadius: 6,
          padding: '7px 14px', fontSize: 12, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", cursor: refreshing ? 'not-allowed' : 'pointer',
          opacity: refreshing ? 0.7 : 1, transition: 'all 0.2s',
        }}
        onMouseEnter={e => { if (!refreshing) e.currentTarget.style.background = '#A93226'; }}
        onMouseLeave={e => { if (!refreshing) e.currentTarget.style.background = '#C0392B'; }}
        >
          <RefreshCw size={12} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Syncing…' : 'Refresh'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#27AE60', boxShadow: '0 0 8px #27AE6077', animation: 'pulse 2s ease infinite' }} />
          <span style={{ fontSize: 11, color: '#27AE60', fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>Live</span>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </nav>
  );
}