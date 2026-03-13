import { Heart, MessageCircle, Share2, ExternalLink } from 'lucide-react';

function fmt(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

export default function PostCard({ post, platform = 'fb', delay = 0 }) {
  return (
    <div style={{
      background: '#161616',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      opacity: 0,
      animation: 'fadeUp 0.4s ease forwards',
      animationDelay: `${delay}ms`,
      transition: 'border-color 0.2s, transform 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(192,57,43,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ height: 120, background: '#1E1E1E', position: 'relative', overflow: 'hidden' }}>
        {post.image
          ? <img src={post.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, color: '#333', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em' }}>NO IMAGE</span>
            </div>
        }
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span style={{ background: '#C0392B', color: '#fff', fontSize: 9, fontFamily: "'DM Mono', monospace", fontWeight: 500, letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 4 }}>
            {platform === 'ig' ? 'IG' : 'FB'}
          </span>
        </div>
      </div>

      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 12, color: '#909090', lineHeight: 1.6, flex: 1, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          {post.message || <span style={{ color: '#444', fontStyle: 'italic' }}>No caption</span>}
        </p>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#C0392B', fontFamily: "'DM Mono', monospace" }}>
            <Heart size={11} fill="#C0392B" color="#C0392B" /> {fmt(post.likes)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#555', fontFamily: "'DM Mono', monospace" }}>
            <MessageCircle size={11} color="#555" /> {fmt(post.comments)}
          </div>
          {post.shares > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#555', fontFamily: "'DM Mono', monospace" }}>
              <Share2 size={11} color="#555" /> {fmt(post.shares)}
            </div>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 10, color: '#444', fontFamily: "'DM Mono', monospace" }}>{fmt(post.interactions)}</div>
        </div>
        {post.url && (
          <a href={post.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#C0392B', textDecoration: 'none', fontFamily: "'DM Mono', monospace" }}>
            <ExternalLink size={10} /> View Post
          </a>
        )}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}