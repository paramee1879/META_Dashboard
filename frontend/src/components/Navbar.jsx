import { RefreshCw } from 'lucide-react';

export default function Navbar({ onRefresh, refreshing, lastUpdated }) {
  return (
    <nav style={{
      padding: '16px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '32px',
      background: '#0d0d0d',
      borderBottom: '1px solid rgba(192,57,43,0.25)',
      position: 'relative',
    }}>
      {/* Red left accent */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, #c0392b, #7b241c)' }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ width: 22, height: 2, background: '#c0392b' }} />
          <div style={{ width: 14, height: 2, background: '#555' }} />
          <div style={{ width: 18, height: 2, background: '#c0392b' }} />
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '0.02em' }}>
            INSIGHT<span style={{ color: '#c0392b' }}>BOARD</span>
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#444', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 1 }}>
            Meta Ads Intelligence
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 32 }}>
        {['Dashboard', 'Reports', 'Settings'].map((item, i) => (
          <span key={item} style={{
            fontFamily: "'Space Mono', monospace", fontSize: 11,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: i === 0 ? '#c0392b' : '#444',
            cursor: 'pointer',
            borderBottom: i === 0 ? '1px solid #c0392b' : '1px solid transparent',
            paddingBottom: 2,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { if (i !== 0) e.target.style.color = '#888'; }}
          onMouseLeave={e => { if (i !== 0) e.target.style.color = '#444'; }}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {lastUpdated && (
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#444', letterSpacing: '0.08em' }}>
            {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}

        <button onClick={onRefresh} disabled={refreshing} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'transparent',
          border: '1px solid rgba(192,57,43,0.5)',
          color: '#c0392b', borderRadius: 2,
          padding: '8px 18px',
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          cursor: refreshing ? 'not-allowed' : 'pointer',
          opacity: refreshing ? 0.5 : 1,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.background = 'rgba(192,57,43,0.12)'; e.currentTarget.style.borderColor = '#c0392b'; }}}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(192,57,43,0.5)'; }}
        >
          <RefreshCw size={12} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Syncing' : 'Refresh'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e88', animation: 'pulse 2s ease infinite' }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#22c55e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
      `}</style>
    </nav>
  );
}