export default function MetricCard({ title, value, icon: Icon, subtitle, delay = 0, change }) {
  const isPositive = change && parseFloat(change) >= 0;

  return (
    <div style={{
      background: '#161616',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12,
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
      opacity: 0,
      animation: 'fadeUp 0.4s ease forwards',
      animationDelay: `${delay}ms`,
      cursor: 'default',
      transition: 'border-color 0.2s, background 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'rgba(192,57,43,0.4)';
      e.currentTarget.style.background = '#1A1A1A';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
      e.currentTarget.style.background = '#161616';
    }}
    >
      {/* top left accent line */}
      <div style={{ position: 'absolute', top: 0, left: 20, right: 20, height: 1, background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.5), transparent)' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'rgba(192,57,43,0.1)',
          border: '1px solid rgba(192,57,43,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color="#C0392B" strokeWidth={1.8} />
        </div>
        {change && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
            background: isPositive ? 'rgba(39,174,96,0.12)' : 'rgba(192,57,43,0.12)',
            color: isPositive ? '#27AE60' : '#E74C3C',
            fontFamily: "'DM Mono', monospace",
          }}>
            {isPositive ? '+' : ''}{change}%
          </span>
        )}
      </div>

      <div style={{ fontSize: 11, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
        {title}
      </div>

      <div style={{
        fontSize: 26, fontWeight: 700, color: '#F0F0F0', lineHeight: 1.1,
        fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em',
      }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: 11, color: '#555', marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
          {subtitle}
        </div>
      )}

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}