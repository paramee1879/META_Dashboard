import { Heart, MessageCircle, Share2, ExternalLink } from 'lucide-react';

function fmt(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

export default function PostCard({ post, platform = 'fb', delay = 0 }) {
  const accentColor = platform === 'ig' ? '#e1306c' : '#1877f2';

  return (
    <div className="glass-card animate-in" style={{
      overflow: 'hidden', animationDelay: `${delay}ms`,
      opacity: 0, animationFillMode: 'forwards',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Image */}
      <div style={{ height: 140, background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
        {post.image ? (
          <img src={post.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0e7ff, #fce7f3)', color: '#94a3b8', fontSize: 12 }}>
            No Image
          </div>
        )}
        {/* Platform badge */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: accentColor, color: 'white',
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99
        }}>
          {platform === 'ig' ? 'IG' : 'FB'}
        </div>
        {/* Date */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(0,0,0,0.5)', color: 'white',
          fontSize: 10, padding: '3px 8px', borderRadius: 99
        }}>
          {post.created_time ? new Date(post.created_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12, flex: 1 }}>
          {post.message || 'No caption'}
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
            <Heart size={13} color="#e11d48" fill="#e11d48" />
            {fmt(post.likes)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
            <MessageCircle size={13} color="#0284c7" />
            {fmt(post.comments)}
          </div>
          {post.shares > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
              <Share2 size={13} color="#059669" />
              {fmt(post.shares)}
            </div>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {fmt(post.interactions)} total
          </div>
        </div>

        {post.url && (
          <a href={post.url} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: accentColor, textDecoration: 'none', fontWeight: 500
          }}>
            <ExternalLink size={11} /> View Post
          </a>
        )}
      </div>
    </div>
  );
}