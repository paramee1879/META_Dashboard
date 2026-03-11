export default function MetricCard({ title, value, icon: Icon, color, subtitle, delay = 0 }) {
  const accentMap = {
    mint: '#c0392b', peach: '#e74c3c', lavender: '#a93226',
    sky: '#922b21', rose: '#cb4335', teal: '#b03a2e',
    blue: '#c0392b', pink: '#e74c3c',
  };
  const accent = accentMap[color] || '#c0392b';

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #1c1c1c, #111)',
        border: '1px solid rgba(192,57,43,0.18)',
        borderRadius: 4,
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        opacity: 0,
        animation: 'fadeUp 0.5s ease forwards',
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
        transition: 'border-color 0.3s, transform 0.3s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(192,57,43,0.55)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(192,57,43,0.18)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 3, background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={accent} strokeWidth={1.5} />
        </div>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}88` }} />
      </div>

      <div style={{ fontSize: 10, color: '#555', marginBottom: 8, fontFamily: "'Space Mono', monospace", letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        {title}
      </div>

      <div style={{ fontSize: 28, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </div>

      {subtitle && <div style={{ fontSize: 11, color: '#555', marginTop: 8, fontFamily: "'Space Mono', monospace" }}>{subtitle}</div>}

      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '45%', height: 1, background: `linear-gradient(90deg, ${accent}55, transparent)` }} />

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}