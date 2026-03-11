import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Eye, MousePointer, DollarSign, TrendingUp, Users, Zap, Calendar, Heart, Video, FileText, UserPlus, ChevronDown, Search, RefreshCw } from 'lucide-react';
import MetricCard from './MetricCard';
import PostCard from './PostCard';

const API = '/api';
const AUTO_REFRESH = 60000;

// AD_ACCOUNT is always available — guaranteed to return data
const AD_ACCOUNT_PAGE = {
  fb_page_id: 'AD_ACCOUNT',
  fb_page_name: 'DigiBug ADs (Ad Account)',
  fb_picture: null,
  ig_user_id: null,
  ig_username: null,
  is_ad_account: true,
};

function fmt(val, prefix = '') {
  if (val === undefined || val === null) return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  if (n >= 1_000_000) return prefix + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return prefix + (n / 1_000).toFixed(1) + 'K';
  return prefix + n.toLocaleString();
}
function today() { return new Date().toISOString().split('T')[0]; }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; }

function SectionHeader({ title, emoji }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, marginTop: 8 }}>
      <div style={{ width: 3, height: 24, background: '#c0392b', borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 10, color: '#c0392b', fontFamily: "'Space Mono', monospace", letterSpacing: '0.18em', textTransform: 'uppercase' }}>{emoji}</span>
      <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#fff', letterSpacing: '0.02em' }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(192,57,43,0.3), transparent)', marginLeft: 4 }} />
    </div>
  );
}

export default function Dashboard({ onDateChange }) {
  // Always start with AD_ACCOUNT so data loads immediately on mount
  const [pages, setPages] = useState([AD_ACCOUNT_PAGE]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState(AD_ACCOUNT_PAGE);
  const [showPagePicker, setShowPagePicker] = useState(false);
  const [pageSearch, setPageSearch] = useState('');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [fromDate, setFromDate] = useState(daysAgo(30));
  const [toDate, setToDate] = useState(today());
  const [showPicker, setShowPicker] = useState(false);
  const [activePreset, setActivePreset] = useState(30);

  const [activeTab, setActiveTab] = useState('both');

  // Load pages from backend in background — don't block initial render
  useEffect(() => {
    axios.get(`${API}/pages`)
      .then(res => {
        const p = res.data.pages || [];
        const hasAdAccount = p.some(x => x.fb_page_id === 'AD_ACCOUNT');
        setPages(hasAdAccount ? p : [AD_ACCOUNT_PAGE, ...p]);
      })
      .catch(err => console.error('Pages load error:', err))
      .finally(() => setPagesLoading(false));
  }, []);

  const fetchInsights = useCallback(async (page, from, to) => {
    if (!page) return;
    try {
      setLoading(true);
      setError(null);
      // New backend: GET /insights?since=...&until=...
      // Old backend: GET /insights?fb_page_id=...&since=...&until=...
      // Support both by sending all params
      const res = await axios.get(`${API}/insights`, {
        params: {
          since: from,
          until: to,
          fb_page_id: page.fb_page_id,
          ig_user_id: page.ig_user_id || undefined,
        }
      });
      setData(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
      onDateChange?.({ since: from, until: to });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch insights. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [onDateChange]);

  // Fetch immediately on mount using AD_ACCOUNT
  useEffect(() => {
    fetchInsights(AD_ACCOUNT_PAGE, fromDate, toDate);
  }, []);

  // Auto-refresh
  useEffect(() => {
    const t = setInterval(() => {
      if (selectedPage) fetchInsights(selectedPage, fromDate, toDate);
    }, AUTO_REFRESH);
    return () => clearInterval(t);
  }, [selectedPage, fromDate, toDate]);

  const handlePreset = (days) => {
    const from = daysAgo(days), to = today();
    setFromDate(from); setToDate(to); setActivePreset(days); setShowPicker(false);
    fetchInsights(selectedPage, from, to);
  };

  const handlePageSelect = (page) => {
    setSelectedPage(page);
    setShowPagePicker(false);
    setPageSearch('');
    fetchInsights(page, fromDate, toDate);
  };

  const filteredPages = pages.filter(p =>
    p.fb_page_name?.toLowerCase().includes(pageSearch.toLowerCase()) ||
    p.ig_username?.toLowerCase().includes(pageSearch.toLowerCase())
  );

  // Support both backend formats:
  // New format: { rows: [{impressions, clicks, ...}], count: N }
  // Old format: { ad_insights: {impressions, clicks, ...}, ... }
  const ads = data?.rows?.[0] || data?.ad_insights || {};
  const fbPage = data?.fb_page || {};
  const fbPosts = data?.fb_posts || [];
  const ig = data?.ig_insights || {};
  const igPosts = data?.ig_posts || [];
  const isAdAccount = selectedPage?.fb_page_id === 'AD_ACCOUNT';

  const adMetrics = [
    { title: 'Impressions', value: fmt(ads.impressions),                                       icon: Eye,         color: 'sky',      delay: 0   },
    { title: 'Clicks',      value: fmt(ads.clicks),                                            icon: MousePointer,color: 'mint',     delay: 60  },
    { title: 'Total Spend', value: ads.spend ? `$${parseFloat(ads.spend).toFixed(2)}` : '—',  icon: DollarSign,  color: 'peach',    delay: 120 },
    { title: 'Reach',       value: fmt(ads.reach),                                             icon: Users,       color: 'teal',     delay: 180 },
    { title: 'CPC',         value: ads.cpc ? `$${parseFloat(ads.cpc).toFixed(2)}` : '—',     icon: TrendingUp,  color: 'lavender', delay: 240 },
    { title: 'CTR',         value: ads.ctr ? `${parseFloat(ads.ctr).toFixed(2)}%` : '—',     icon: Zap,         color: 'rose',     delay: 300 },
    { title: 'Frequency',   value: ads.frequency ? parseFloat(ads.frequency).toFixed(2) : '—',icon: RefreshCw,   color: 'blue',     delay: 360 },
  ];

  const fbMetrics = [
    { title: 'Total Fans',    value: fmt(fbPage.page_fans),          icon: Users,    color: 'blue',  delay: 0   },
    { title: 'Reach',         value: fmt(fbPage.page_reach),         icon: Eye,      color: 'sky',   delay: 60  },
    { title: 'Impressions',   value: fmt(fbPage.page_impressions),   icon: Eye,      color: 'mint',  delay: 120 },
    { title: 'Engaged Users', value: fmt(fbPage.page_engaged_users), icon: Heart,    color: 'rose',  delay: 180 },
    { title: 'Video Views',   value: fmt(fbPage.page_video_views),   icon: Video,    color: 'peach', delay: 240 },
    { title: 'New Fans',      value: fmt(fbPage.page_fan_adds),      icon: UserPlus, color: 'teal',  delay: 300 },
  ];

  const igMetrics = [
    { title: 'Followers',     value: fmt(ig.followers_count), icon: Users,    color: 'pink',     delay: 0   },
    { title: 'Impressions',   value: fmt(ig.impressions),     icon: Eye,      color: 'lavender', delay: 60  },
    { title: 'Reach',         value: fmt(ig.reach),           icon: Eye,      color: 'rose',     delay: 120 },
    { title: 'Profile Views', value: fmt(ig.profile_views),   icon: Users,    color: 'peach',    delay: 180 },
    { title: 'Total Posts',   value: fmt(ig.media_count),     icon: FileText, color: 'teal',     delay: 240 },
  ];

  const chartData = isAdAccount
    ? [
        { name: 'Impressions', value: parseFloat(ads.impressions || 0) },
        { name: 'Clicks',      value: parseFloat(ads.clicks || 0) },
        { name: 'Reach',       value: parseFloat(ads.reach || 0) },
      ]
    : [
        { name: 'FB Impressions', value: parseFloat(fbPage.page_impressions || 0) },
        { name: 'FB Reach',       value: parseFloat(fbPage.page_reach || 0) },
        { name: 'Ad Clicks',      value: parseFloat(ads.clicks || 0) },
        { name: 'IG Impressions', value: parseFloat(ig.impressions || 0) },
        { name: 'IG Reach',       value: parseFloat(ig.reach || 0) },
      ];

  const presets = [
    { label: '7D', days: 7 }, { label: '30D', days: 30 },
    { label: '90D', days: 90 }, { label: '6M', days: 180 }, { label: '1Y', days: 365 },
  ];

  return (
    <div>
      {/* ── Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>

        {/* Page Selector */}
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <button onClick={() => setShowPagePicker(p => !p)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            background: '#111', border: '1px solid rgba(192,57,43,0.3)',
            borderRadius: 2, padding: '10px 16px', fontSize: 12,
            fontFamily: "'Space Mono', monospace", letterSpacing: '0.06em',
            cursor: 'pointer', color: '#fff',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(192,57,43,0.7)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(192,57,43,0.3)'}
          >
            {selectedPage?.fb_picture
              ? <img src={selectedPage.fb_picture} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} alt="" />
              : <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#1877f2,#0a5ed4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>D</div>
            }
            <span style={{ flex: 1, textAlign: 'left' }}>{selectedPage?.fb_page_name || 'Select a page'}</span>
            {selectedPage?.ig_username && <span style={{ fontSize: 11, color: '#e1306c', fontWeight: 600 }}>@{selectedPage.ig_username}</span>}
            <ChevronDown size={14} />
          </button>

          {showPagePicker && (
            <div style={{
              position: 'absolute', left: 0, top: 'calc(100% + 6px)',
              background: '#0f0f0f',
              border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: 4,
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              zIndex: 200, width: '100%', minWidth: 320, maxHeight: 400, overflow: 'hidden',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(192,57,43,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1a1a1a', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 2, padding: '7px 12px' }}>
                  <Search size={13} color="#555" />
                  <input autoFocus placeholder="Search pages…" value={pageSearch} onChange={e => setPageSearch(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, flex: 1, color: '#fff', fontFamily: "'Space Mono', monospace" }} />
                </div>
                <div style={{ fontSize: 10, color: '#444', marginTop: 6, fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em' }}>
                  {pagesLoading ? 'Loading…' : `${filteredPages.length} pages`}
                </div>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {filteredPages.map(page => (
                  <div key={page.fb_page_id} onClick={() => handlePageSelect(page)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer',
                    background: selectedPage?.fb_page_id === page.fb_page_id ? 'rgba(192,57,43,0.1)' : 'transparent',
                    borderLeft: selectedPage?.fb_page_id === page.fb_page_id ? '2px solid #c0392b' : '2px solid transparent',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { if (selectedPage?.fb_page_id !== page.fb_page_id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (selectedPage?.fb_page_id !== page.fb_page_id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {page.fb_picture
                      ? <img src={page.fb_picture} style={{ width: 32, height: 32, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} alt="" />
                      : <div style={{ width: 32, height: 32, borderRadius: 2, background: page.is_ad_account ? '#c0392b22' : '#1a1a1a', border: '1px solid rgba(192,57,43,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#c0392b', fontWeight: 700, flexShrink: 0, fontFamily: "'Playfair Display', serif" }}>
                          {page.is_ad_account ? 'D' : 'f'}
                        </div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff', fontFamily: "'Space Mono', monospace" }}>{page.fb_page_name}</div>
                      {page.ig_username && <div style={{ fontSize: 10, color: '#c0392b', fontFamily: "'Space Mono', monospace" }}>@{page.ig_username}</div>}
                      {page.is_ad_account && <div style={{ fontSize: 10, color: '#555', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em' }}>ad account metrics</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab switcher — only relevant for real pages */}
        {!isAdAccount && (
          <div style={{ display: 'flex', gap: 2, background: '#111', padding: 3, borderRadius: 2, border: '1px solid rgba(192,57,43,0.2)' }}>
            {[{k:'both',l:'ALL'},{k:'facebook',l:'FB'},{k:'instagram',l:'IG'}].map(tab => (
              <button key={tab.k} onClick={() => setActiveTab(tab.k)} style={{
                padding: '6px 14px', borderRadius: 2, border: 'none', fontSize: 10, fontWeight: 700,
                fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em',
                cursor: 'pointer',
                background: activeTab === tab.k ? '#c0392b' : 'transparent',
                color: activeTab === tab.k ? '#fff' : '#555',
                transition: 'all 0.2s'
              }}>{tab.l}</button>
            ))}
          </div>
        )}

        {/* Preset pills */}
        <div style={{ display: 'flex', gap: 2, background: '#111', padding: 3, borderRadius: 2, border: '1px solid rgba(192,57,43,0.2)' }}>
          {presets.map(p => (
            <button key={p.days} onClick={() => handlePreset(p.days)} style={{
              padding: '5px 12px', borderRadius: 2, border: 'none', fontSize: 10, fontWeight: 700,
              fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em',
              cursor: 'pointer',
              background: activePreset === p.days ? '#c0392b' : 'transparent',
              color: activePreset === p.days ? '#fff' : '#555',
              transition: 'all 0.2s'
            }}>{p.label}</button>
          ))}
        </div>

        {/* Custom date */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowPicker(p => !p)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#111', border: '1px solid rgba(192,57,43,0.3)',
            borderRadius: 2, padding: '10px 16px',
            fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.06em',
            cursor: 'pointer', color: '#aaa',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(192,57,43,0.7)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(192,57,43,0.3)'}
          >
            <Calendar size={14} color="var(--accent)" />
            {fromDate} → {toDate}
          </button>
          {showPicker && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: '#0f0f0f',
              border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: 4,
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)', padding: 20, zIndex: 100, minWidth: 280,
            }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: '#555', display: 'block', marginBottom: 4, fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>From</label>
                  <input type="date" value={fromDate} max={toDate} onChange={e => { setFromDate(e.target.value); setActivePreset(null); }}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 2, border: '1px solid rgba(192,57,43,0.25)', fontSize: 12, outline: 'none', background: '#1a1a1a', color: '#fff', fontFamily: "'Space Mono', monospace" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: '#555', display: 'block', marginBottom: 4, fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>To</label>
                  <input type="date" value={toDate} min={fromDate} max={today()} onChange={e => { setToDate(e.target.value); setActivePreset(null); }}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 2, border: '1px solid rgba(192,57,43,0.25)', fontSize: 12, outline: 'none', background: '#1a1a1a', color: '#fff', fontFamily: "'Space Mono', monospace" }} />
                </div>
              </div>
              <button onClick={() => { setShowPicker(false); fetchInsights(selectedPage, fromDate, toDate); }}
                style={{ width: '100%', padding: '10px', background: '#c0392b', color: 'white', border: 'none', borderRadius: 2, fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 14 }}>
                Apply Date Range
              </button>
            </div>
          )}
        </div>
      </div>

      {lastUpdated && !loading && (
        <div style={{ fontSize: 10, color: '#444', marginBottom: 20, fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em' }}>
          ◈ Last synced: {lastUpdated} · {fromDate} → {toDate}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.4)', borderRadius: 2, padding: '12px 18px', marginBottom: 20, color: '#e74c3c', fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
          ✕ {error}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: '#555', fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div style={{ width: 16, height: 16, border: '1px solid #333', borderTop: '1px solid #c0392b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Fetching data…
        </div>
      )}

      {data && (
        <>
          {/* ── AD ACCOUNT VIEW ── */}
          {isAdAccount && (
            <div style={{ marginBottom: 36 }}>
              <SectionHeader title="DigiBug Ads Performance" emoji="◈" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12, marginBottom: 24 }}>
                {adMetrics.map(m => <MetricCard key={m.title} {...m} />)}
              </div>
              {ads.spend && (
                <div className="glass" style={{ padding: '24px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', borderLeft: '3px solid #c0392b' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: '#555', marginBottom: 6, fontFamily: "'Space Mono', monospace", letterSpacing: '0.14em', textTransform: 'uppercase' }}>Total Ad Spend</div>
                    <div style={{ fontSize: 40, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#fff' }}>${parseFloat(ads.spend).toFixed(2)}</div>
                    <div style={{ fontSize: 10, color: '#444', marginTop: 4, fontFamily: "'Space Mono', monospace" }}>{fromDate} → {toDate}</div>
                  </div>
                  {[
                    { label: 'Impressions', val: fmt(ads.impressions) },
                    { label: 'Clicks',      val: fmt(ads.clicks) },
                    { label: 'Reach',       val: fmt(ads.reach) },
                    { label: 'CTR',         val: ads.ctr ? `${parseFloat(ads.ctr).toFixed(2)}%` : '—' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0 16px', borderLeft: '1px solid rgba(192,57,43,0.15)' }}>
                      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#fff' }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: '#555', fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
              {!ads.impressions && !loading && (
                <div style={{ padding: '16px 20px', background: 'rgba(192,57,43,0.05)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 2, fontSize: 11, color: '#c0392b', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em' }}>
                  ◈ No ad data for this date range. Try selecting <strong>1Y</strong>.
                </div>
              )}
            </div>
          )}

          {/* ── FACEBOOK SECTION ── */}
          {!isAdAccount && (activeTab === 'both' || activeTab === 'facebook') && (
            <div style={{ marginBottom: 36 }}>
              <SectionHeader title="Facebook Overview" emoji="f" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12, marginBottom: 16 }}>
                {fbMetrics.map(m => <MetricCard key={m.title} {...m} />)}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: "'Space Mono', monospace", marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 1, background: '#c0392b' }} />
                Ads Performance
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12 }}>
                {adMetrics.map(m => <MetricCard key={m.title} {...m} />)}
              </div>
              {fbPosts.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, fontFamily: "'Playfair Display', serif", color: '#fff' }}>Top Facebook Posts</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                    {fbPosts.map((post, i) => <PostCard key={post.id} post={post} platform="fb" delay={i * 80} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── INSTAGRAM SECTION ── */}
          {!isAdAccount && (activeTab === 'both' || activeTab === 'instagram') && selectedPage?.ig_user_id && (
            <div style={{ marginBottom: 36 }}>
              <SectionHeader title="Instagram Overview" emoji="◉" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12 }}>
                {igMetrics.map(m => <MetricCard key={m.title} {...m} />)}
              </div>
              {igPosts.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, fontFamily: "'Playfair Display', serif", color: '#fff' }}>Top Instagram Posts</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                    {igPosts.map((post, i) => <PostCard key={post.id} post={post} platform="ig" delay={i * 80} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CHART ── */}
          <div className="glass" style={{ padding: '28px 32px' }}>
            <h3 style={{ marginBottom: 4, fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#fff' }}>Performance Overview</h3>
            <p style={{ fontSize: 10, color: '#444', marginBottom: 24, fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em' }}>{fromDate} → {toDate}</p>
            {chartData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={44}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#555', fontFamily: 'Space Mono, monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#555', fontFamily: 'Space Mono, monospace' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                  <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 4, fontSize: 12, fontFamily: 'Space Mono, monospace', color: '#fff' }} />
                  <Bar dataKey="value" fill="url(#barGrad)" radius={[2, 2, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c0392b" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#7b241c" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#333', fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                No data for this date range
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}