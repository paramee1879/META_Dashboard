import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Eye, MousePointer, DollarSign, TrendingUp, Users, Zap, Calendar, Heart, Video, FileText, UserPlus, ChevronDown, Search, RefreshCw, Activity } from 'lucide-react';
import MetricCard from './MetricCard';
import PostCard from './PostCard';

const API = '/api';
const AUTO_REFRESH = 60000;

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

const S = {
  bg:        '#0D0D0D',
  surface:   '#161616',
  surface2:  '#1E1E1E',
  surface3:  '#252525',
  line:      'rgba(255,255,255,0.07)',
  line2:     'rgba(255,255,255,0.12)',
  accent:    '#C0392B',
  accent2:   '#E74C3C',
  accentDim: 'rgba(192,57,43,0.1)',
  text:      '#F0F0F0',
  text2:     '#909090',
  text3:     '#555555',
  green:     '#27AE60',
};

function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: S.text2, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: S.line }} />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
      <div style={{ color: '#909090', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#F0F0F0', fontWeight: 600 }}>{fmt(payload[0]?.value)}</div>
    </div>
  );
};

export default function Dashboard({ onDateChange }) {
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

  useEffect(() => {
    axios.get(`${API}/pages`)
      .then(res => {
        const p = res.data.pages || [];
        const hasAd = p.some(x => x.fb_page_id === 'AD_ACCOUNT');
        setPages(hasAd ? p : [AD_ACCOUNT_PAGE, ...p]);
      })
      .catch(err => console.error('Pages load error:', err))
      .finally(() => setPagesLoading(false));
  }, []);

  const fetchInsights = useCallback(async (page, from, to) => {
    if (!page) return;
    try {
      setLoading(true); setError(null);
      const res = await axios.get(`${API}/insights`, {
        params: { since: from, until: to, fb_page_id: page.fb_page_id, ig_user_id: page.ig_user_id || undefined }
      });
      setData(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
      onDateChange?.({ since: from, until: to });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch insights.');
    } finally { setLoading(false); }
  }, [onDateChange]);

  useEffect(() => { fetchInsights(AD_ACCOUNT_PAGE, fromDate, toDate); }, []);

  useEffect(() => {
    const t = setInterval(() => { if (selectedPage) fetchInsights(selectedPage, fromDate, toDate); }, AUTO_REFRESH);
    return () => clearInterval(t);
  }, [selectedPage, fromDate, toDate]);

  const handlePreset = (days) => {
    const from = daysAgo(days), to = today();
    setFromDate(from); setToDate(to); setActivePreset(days); setShowPicker(false);
    fetchInsights(selectedPage, from, to);
  };

  const handlePageSelect = (page) => {
    setSelectedPage(page); setShowPagePicker(false); setPageSearch('');
    fetchInsights(page, fromDate, toDate);
  };

  const filteredPages = pages.filter(p =>
    p.fb_page_name?.toLowerCase().includes(pageSearch.toLowerCase()) ||
    p.ig_username?.toLowerCase().includes(pageSearch.toLowerCase())
  );

  const ads     = data?.rows?.[0] || data?.ad_insights || {};
  const fbPage  = data?.fb_page || {};
  const fbPosts = data?.fb_posts || [];
  const ig      = data?.ig_insights || {};
  const igPosts = data?.ig_posts || [];
  const isAdAccount = selectedPage?.fb_page_id === 'AD_ACCOUNT';

  const adMetrics = [
    { title: 'Impressions', value: fmt(ads.impressions),                                        icon: Eye,          delay: 0   },
    { title: 'Clicks',      value: fmt(ads.clicks),                                             icon: MousePointer, delay: 50  },
    { title: 'Total Spend', value: ads.spend ? `$${parseFloat(ads.spend).toFixed(2)}` : '—',   icon: DollarSign,   delay: 100 },
    { title: 'Reach',       value: fmt(ads.reach),                                              icon: Users,        delay: 150 },
    { title: 'CPC',         value: ads.cpc  ? `$${parseFloat(ads.cpc).toFixed(2)}`  : '—',     icon: TrendingUp,   delay: 200 },
    { title: 'CTR',         value: ads.ctr  ? `${parseFloat(ads.ctr).toFixed(2)}%`  : '—',     icon: Zap,          delay: 250 },
    { title: 'Frequency',   value: ads.frequency ? parseFloat(ads.frequency).toFixed(2) : '—', icon: Activity,     delay: 300 },
  ];

  const fbMetrics = [
    { title: 'Total Fans',    value: fmt(fbPage.page_fans),          icon: Users,    delay: 0   },
    { title: 'Reach',         value: fmt(fbPage.page_reach),         icon: Eye,      delay: 50  },
    { title: 'Impressions',   value: fmt(fbPage.page_impressions),   icon: Eye,      delay: 100 },
    { title: 'Engaged Users', value: fmt(fbPage.page_engaged_users), icon: Heart,    delay: 150 },
    { title: 'Video Views',   value: fmt(fbPage.page_video_views),   icon: Video,    delay: 200 },
    { title: 'New Fans',      value: fmt(fbPage.page_fan_adds),      icon: UserPlus, delay: 250 },
  ];

  const igMetrics = [
    { title: 'Followers',     value: fmt(ig.followers_count), icon: Users,    delay: 0   },
    { title: 'Impressions',   value: fmt(ig.impressions),     icon: Eye,      delay: 50  },
    { title: 'Reach',         value: fmt(ig.reach),           icon: Eye,      delay: 100 },
    { title: 'Profile Views', value: fmt(ig.profile_views),   icon: Users,    delay: 150 },
    { title: 'Total Posts',   value: fmt(ig.media_count),     icon: FileText, delay: 200 },
  ];

  const chartData = isAdAccount
    ? [
        { name: 'Impressions', value: parseFloat(ads.impressions || 0) },
        { name: 'Clicks',      value: parseFloat(ads.clicks || 0) },
        { name: 'Reach',       value: parseFloat(ads.reach || 0) },
      ]
    : [
        { name: 'FB Impr.',  value: parseFloat(fbPage.page_impressions || 0) },
        { name: 'FB Reach',  value: parseFloat(fbPage.page_reach || 0) },
        { name: 'Ad Clicks', value: parseFloat(ads.clicks || 0) },
        { name: 'IG Impr.',  value: parseFloat(ig.impressions || 0) },
        { name: 'IG Reach',  value: parseFloat(ig.reach || 0) },
      ];

  const presets = [
    { label: '7D', days: 7 }, { label: '30D', days: 30 },
    { label: '90D', days: 90 }, { label: '6M', days: 180 }, { label: '1Y', days: 365 },
  ];

  return (
    <div style={{ background: S.bg, minHeight: '100vh', padding: '28px 32px' }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Page selector */}
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <button onClick={() => setShowPagePicker(p => !p)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            background: S.surface, border: `1px solid ${showPagePicker ? 'rgba(192,57,43,0.5)' : S.line}`,
            borderRadius: 8, padding: '9px 14px',
            fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
            cursor: 'pointer', color: S.text, transition: 'border-color 0.15s',
          }}>
            {selectedPage?.fb_picture
              ? <img src={selectedPage.fb_picture} style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} alt="" />
              : <div style={{ width: 20, height: 20, borderRadius: 4, background: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>D</div>
            }
            <span style={{ flex: 1, textAlign: 'left' }}>{selectedPage?.fb_page_name || 'Select a page'}</span>
            {selectedPage?.ig_username && <span style={{ fontSize: 11, color: S.text3, fontFamily: "'DM Mono', monospace" }}>@{selectedPage.ig_username}</span>}
            <ChevronDown size={14} color={S.text3} />
          </button>
          {showPagePicker && (
            <div style={{
              position: 'absolute', left: 0, top: 'calc(100% + 6px)',
              background: S.surface, border: `1px solid ${S.line2}`,
              borderRadius: 10, boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              zIndex: 200, width: '100%', minWidth: 300, maxHeight: 360,
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ padding: '10px 12px', borderBottom: `1px solid ${S.line}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: S.surface2, borderRadius: 6, padding: '7px 10px' }}>
                  <Search size={13} color={S.text3} />
                  <input autoFocus placeholder="Search pages…" value={pageSearch} onChange={e => setPageSearch(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, flex: 1, color: S.text, fontFamily: "'DM Sans', sans-serif" }} />
                </div>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {filteredPages.map(page => (
                  <div key={page.fb_page_id} onClick={() => handlePageSelect(page)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer',
                      background: selectedPage?.fb_page_id === page.fb_page_id ? S.accentDim : 'transparent',
                      borderLeft: `2px solid ${selectedPage?.fb_page_id === page.fb_page_id ? S.accent : 'transparent'}`,
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { if (selectedPage?.fb_page_id !== page.fb_page_id) e.currentTarget.style.background = S.surface2; }}
                    onMouseLeave={e => { if (selectedPage?.fb_page_id !== page.fb_page_id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {page.fb_picture
                      ? <img src={page.fb_picture} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} alt="" />
                      : <div style={{ width: 28, height: 28, borderRadius: 6, background: S.accentDim, border: `1px solid rgba(192,57,43,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.accent, fontSize: 12, fontWeight: 700 }}>
                          {page.is_ad_account ? 'D' : 'f'}
                        </div>
                    }
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: S.text, fontFamily: "'DM Sans', sans-serif" }}>{page.fb_page_name}</div>
                      {page.ig_username && <div style={{ fontSize: 11, color: S.text3, fontFamily: "'DM Mono', monospace" }}>@{page.ig_username}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab toggle */}
        {!isAdAccount && (
          <div style={{ display: 'flex', background: S.surface, border: `1px solid ${S.line}`, borderRadius: 8, padding: 3, gap: 2 }}>
            {[{k:'both',l:'All'},{k:'facebook',l:'Facebook'},{k:'instagram',l:'Instagram'}].map(tab => (
              <button key={tab.k} onClick={() => setActiveTab(tab.k)} style={{
                padding: '6px 14px', borderRadius: 6, border: 'none',
                fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer', transition: 'all 0.15s',
                background: activeTab === tab.k ? S.accent : 'transparent',
                color:      activeTab === tab.k ? '#fff'   : S.text3,
              }}>{tab.l}</button>
            ))}
          </div>
        )}

        {/* Presets */}
        <div style={{ display: 'flex', background: S.surface, border: `1px solid ${S.line}`, borderRadius: 8, padding: 3, gap: 2 }}>
          {presets.map(p => (
            <button key={p.days} onClick={() => handlePreset(p.days)} style={{
              padding: '6px 12px', borderRadius: 6, border: 'none',
              fontSize: 12, fontWeight: 500, fontFamily: "'DM Mono', monospace",
              cursor: 'pointer', transition: 'all 0.15s',
              background: activePreset === p.days ? S.accent : 'transparent',
              color:      activePreset === p.days ? '#fff'   : S.text3,
            }}>{p.label}</button>
          ))}
        </div>

        {/* Date range */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowPicker(p => !p)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: S.surface, border: `1px solid ${showPicker ? 'rgba(192,57,43,0.5)' : S.line}`,
            borderRadius: 8, padding: '9px 14px',
            fontSize: 12, fontFamily: "'DM Mono', monospace",
            cursor: 'pointer', color: S.text2, transition: 'border-color 0.15s',
          }}>
            <Calendar size={13} color={S.accent} />
            {fromDate} → {toDate}
          </button>
          {showPicker && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)',
              background: S.surface, border: `1px solid ${S.line2}`,
              borderRadius: 10, boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              padding: 20, zIndex: 100, minWidth: 280,
            }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[['From', fromDate, e => { setFromDate(e.target.value); setActivePreset(null); }, null, toDate],
                  ['To',   toDate,   e => { setToDate(e.target.value);   setActivePreset(null); }, fromDate, today()]
                ].map(([label, val, onChange, min, max]) => (
                  <div key={label} style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: S.text3, display: 'block', marginBottom: 5, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
                    <input type="date" value={val} min={min} max={max} onChange={onChange}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${S.line}`, fontSize: 12, outline: 'none', background: S.surface2, color: S.text, fontFamily: "'DM Mono', monospace' " }} />
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowPicker(false); fetchInsights(selectedPage, fromDate, toDate); }}
                style={{ width: '100%', padding: 10, background: S.accent, color: '#fff', border: 'none', borderRadius: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: S.text3, fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ width: 14, height: 14, border: `1.5px solid ${S.surface3}`, borderTop: `1.5px solid ${S.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Fetching data…
          </div>
        )}
        {lastUpdated && !loading && (
          <span style={{ fontSize: 11, color: S.text3, fontFamily: "'DM Mono', monospace" }}>
            Updated {lastUpdated}  ·  {fromDate} → {toDate}
          </span>
        )}
        {error && <span style={{ fontSize: 12, color: S.accent2, fontFamily: "'DM Sans', sans-serif" }}>⚠ {error}</span>}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>

      {data && (
        <>
          {/* ── Ad Account ── */}
          {isAdAccount && (
            <div style={{ marginBottom: 40 }}>
              {/* Summary hero */}
              {ads.spend && (
                <div style={{
                  background: S.surface, border: `1px solid ${S.line}`,
                  borderRadius: 12, padding: '28px 32px', marginBottom: 20,
                  display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap',
                  borderLeft: `3px solid ${S.accent}`,
                  animation: 'fadeUp 0.3s ease forwards',
                }}>
                  <div style={{ flex: 1, paddingRight: 32, borderRight: `1px solid ${S.line}` }}>
                    <div style={{ fontSize: 11, color: S.text3, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>Total Ad Spend</div>
                    <div style={{ fontSize: 44, fontWeight: 700, color: S.text, lineHeight: 1, fontFamily: "'Fraunces', serif", letterSpacing: '-0.03em' }}>
                      ${parseFloat(ads.spend).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: S.text3, marginTop: 8, fontFamily: "'DM Mono', monospace" }}>{fromDate} → {toDate}</div>
                  </div>
                  {[
                    { label: 'Impressions', val: fmt(ads.impressions) },
                    { label: 'Clicks',      val: fmt(ads.clicks) },
                    { label: 'Reach',       val: fmt(ads.reach) },
                    { label: 'CTR',         val: ads.ctr ? `${parseFloat(ads.ctr).toFixed(2)}%` : '—' },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '0 24px', borderRight: `1px solid ${S.line}` }}>
                      <div style={{ fontSize: 26, fontWeight: 700, color: S.text, fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em' }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: S.text3, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
              <SectionLabel>Ad Performance</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 10 }}>
                {adMetrics.map(m => <MetricCard key={m.title} {...m} />)}
              </div>
              {!ads.impressions && !loading && (
                <div style={{ marginTop: 12, padding: '14px 18px', background: S.accentDim, border: `1px solid rgba(192,57,43,0.2)`, borderRadius: 8, fontSize: 12, color: S.text2, fontFamily: "'DM Sans', sans-serif" }}>
                  No ad data for this range — try <strong>1Y</strong>.
                </div>
              )}
            </div>
          )}

          {/* ── Facebook ── */}
          {!isAdAccount && (activeTab === 'both' || activeTab === 'facebook') && (
            <div style={{ marginBottom: 40 }}>
              <SectionLabel>Facebook Page</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 10, marginBottom: 24 }}>
                {fbMetrics.map(m => <MetricCard key={m.title} {...m} />)}
              </div>
              <SectionLabel>Ad Performance</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 10 }}>
                {adMetrics.map(m => <MetricCard key={m.title} {...m} />)}
              </div>
              {fbPosts.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <SectionLabel>Top Facebook Posts</SectionLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
                    {fbPosts.map((post, i) => <PostCard key={post.id} post={post} platform="fb" delay={i * 60} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Instagram ── */}
          {!isAdAccount && (activeTab === 'both' || activeTab === 'instagram') && selectedPage?.ig_user_id && (
            <div style={{ marginBottom: 40 }}>
              <SectionLabel>Instagram</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 10 }}>
                {igMetrics.map(m => <MetricCard key={m.title} {...m} />)}
              </div>
              {igPosts.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <SectionLabel>Top Instagram Posts</SectionLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
                    {igPosts.map((post, i) => <PostCard key={post.id} post={post} platform="ig" delay={i * 60} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Chart ── */}
          <div style={{ background: S.surface, border: `1px solid ${S.line}`, borderRadius: 12, padding: '24px 28px', animation: 'fadeUp 0.5s 300ms ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: S.text, fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>Performance Overview</h3>
                <p style={{ fontSize: 11, color: S.text3, fontFamily: "'DM Mono', monospace" }}>{fromDate} → {toDate}</p>
              </div>
            </div>
            {chartData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={36} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#555', fontFamily: 'DM Sans, sans-serif' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#555', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }} />
                  <Bar dataKey="value" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#E74C3C" stopOpacity={1} />
                      <stop offset="100%" stopColor="#C0392B" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: S.text3, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                No data for this date range
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}