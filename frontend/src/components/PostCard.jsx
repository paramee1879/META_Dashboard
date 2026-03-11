import { Heart, MessageCircle, Share2, ExternalLink } from 'lucide-react';

function fmt(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

export default function PostCard({ post, platform = 'fb', delay = 0 }) {
  const accent = platform === 'ig' ? '#c0392b' : '#922b21';

  return (
    <div style={{
      background: 'linear-gradient(145deg, #1c1c1c, #111)',
      border: '1px solid rgba(192,57,43,0.15)',
      borderRadius: 4,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      opacity: 0,
      animation: 'fadeUp 0.5s ease forwards',
      animationDelay: `${delay}ms`,
      animationFillMode: 'forwards',
      transition: 'border-color 0.3s, transform 0.3s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(192,57,43,0.45)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(192,57,43,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Image */}
      <div style={{ height: 130, background: '#0d0d0d', position: 'relative', overflow: 'hidden' }}>
        {post.image ? (
          <img src={post.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'repeating-linear-gradient(45deg,#111,#111 10px,#151515 10px,#151515 20px)' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#333', letterSpacing: '0.15em', textTransform: 'uppercase' }}>No Image</span>
          </div>
        )}
        {/* Top overlay bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 32, background: 'linear-gradient(180deg,rgba(0,0,0,0.7),transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
          <div style={{ background: accent, color: 'white', fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: '0.14em', padding: '3px 8px', borderRadius: 2 }}>
            {platform === 'ig' ? 'INSTAGRAM' : 'FACEBOOK'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, fontFamily: "'Space Mono', monospace" }}>
            {post.created_time ? new Date(post.created_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : ''}
          </div>
        </div>
        {/* Bottom gradient */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(0deg,rgba(0,0,0,0.8),transparent)' }} />
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, flex: 1, fontFamily: 'Georgia, serif', margin: 0 }}>
          {post.message || <span style={{ color: '#444', fontStyle: 'italic' }}>No caption</span>}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(192,57,43,0.12)' }} />

        {/* Stats */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#ddd', fontFamily: "'Space Mono', monospace" }}>
            <Heart size={12} color="#c0392b" fill="#c0392b" />
            {fmt(post.likes)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#ddd', fontFamily: "'Space Mono', monospace" }}>
            <MessageCircle size={12} color="#888" />
            {fmt(post.comments)}
          </div>
          {post.shares > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#ddd', fontFamily: "'Space Mono', monospace" }}>
              <Share2 size={12} color="#888" />
              {fmt(post.shares)}
            </div>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 10, color: '#444', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em' }}>
            {fmt(post.interactions)} total
          </div>
        </div>

        {post.url && (
          <a href={post.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: accent, textDecoration: 'none', fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <ExternalLink size={10} /> View Post
          </a>
        )}
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}