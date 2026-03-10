export default function MetricCard({ title, value, icon: Icon, color, subtitle, delay = 0 }) {
  const colorMap = {
    mint:     { bg: '#c8f0e0', accent: '#059669', iconBg: 'rgba(5,150,105,0.12)' },
    peach:    { bg: '#fde8c8', accent: '#d97706', iconBg: 'rgba(217,119,6,0.12)' },
    lavender: { bg: '#e4d8f8', accent: '#7c3aed', iconBg: 'rgba(124,58,237,0.12)' },
    sky:      { bg: '#cce8f8', accent: '#0284c7', iconBg: 'rgba(2,132,199,0.12)' },
    rose:     { bg: '#fde2e2', accent: '#dc2626', iconBg: 'rgba(220,38,38,0.12)' },
    teal:     { bg: '#ccf0f0', accent: '#0d9488', iconBg: 'rgba(13,148,136,0.12)' },
  };

  const c = colorMap[color] || colorMap.mint;

  return (
    <div
      className="glass-card animate-in"
      style={{
        padding: '22px',
        animationDelay: `${delay}ms`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: c.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={20} color={c.accent} />
        </div>
        {/* Colored dot */}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.accent, marginTop: 4 }} />
      </div>

      {/* Title */}
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>
        {title}
      </div>

      {/* Value */}
      <div style={{ fontSize: 28, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
          {subtitle}
        </div>
      )}

      {/* Color strip at bottom */}
      <div style={{
        height: 3, borderRadius: 99, background: c.bg,
        marginTop: 16,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: '60%', background: c.accent, borderRadius: 99
        }} />
      </div>
    </div>
  );
}