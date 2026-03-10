import { RefreshCw, Activity } from 'lucide-react';

export default function Navbar({ onRefresh, refreshing, lastUpdated }) {
  return (
    <nav className="glass" style={{
      padding: '14px 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #1877f2, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Activity size={18} color="white" />
        </div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18 }}>InsightBoard</span>
      </div>

      <div style={{ display: 'flex', gap: '28px', color: 'var(--text-secondary)', fontSize: 14 }}>
        <span style={{ fontWeight: 500, color: 'var(--accent)' }}>Dashboard</span>
        <span style={{ cursor: 'pointer' }}>Reports</span>
        <span style={{ cursor: 'pointer' }}>Settings</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {lastUpdated && (
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
        <button onClick={onRefresh} disabled={refreshing} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--accent)', color: 'white',
          border: 'none', borderRadius: 10, padding: '8px 16px',
          fontSize: 13, fontWeight: 600, cursor: refreshing ? 'not-allowed' : 'pointer',
          opacity: refreshing ? 0.7 : 1, transition: 'all 0.2s'
        }}>
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse-dot 2s ease infinite' }} />
          <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 500 }}>Live</span>
        </div>
      </div>
    </nav>
  );
}