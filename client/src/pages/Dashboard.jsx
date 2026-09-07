import React, { useState, useEffect } from 'react';
import { 
  Search, 
  HelpCircle, 
  PlusCircle, 
  CheckCircle2, 
  Package, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  BarChart3, 
  PieChart, 
  Layers, 
  CheckCircle,
  Tag,
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ onNavigateToItems, onOpenReportModal, onSelectItem }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityFilter, setActivityFilter] = useState('all'); // 'all' | 'reported' | 'claimed'

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardSummary();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
    if (diffHours > 0) {
      return diffHours === 1 ? '1 hr ago' : `${diffHours} hrs ago`;
    }
    return 'Just now';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'lost':
        return <span className="badge badge-lost"><AlertCircle size={12} /> Lost</span>;
      case 'found':
        return <span className="badge badge-found"><CheckCircle2 size={12} /> Found</span>;
      case 'claimed':
        return <span className="badge badge-claimed"><Sparkles size={12} /> Returned</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  // Compute status percentages for the visual distribution bar
  const total = stats?.counts?.total || 0;
  const lostPercent = total > 0 ? Math.round(((stats?.counts?.lost || 0) / total) * 100) : 0;
  const foundPercent = total > 0 ? Math.round(((stats?.counts?.found || 0) / total) * 100) : 0;
  const claimedPercent = total > 0 ? Math.max(0, 100 - lostPercent - foundPercent) : 0;

  // Build unified recent activity feed
  const combinedActivity = React.useMemo(() => {
    if (!stats) return [];
    const reports = (stats.recentItems || []).map((item) => ({
      ...item,
      activityType: item.status === 'claimed' ? 'claimed' : item.type,
      sortDate: new Date(item.createdAt || item.date).getTime()
    }));

    const claims = (stats.recentClaimed || [])
      .filter((c) => !reports.some((r) => r._id === c._id && r.status === 'claimed'))
      .map((item) => ({
        ...item,
        activityType: 'claimed',
        sortDate: new Date(item.updatedAt || item.date).getTime()
      }));

    return [...reports, ...claims].sort((a, b) => b.sortDate - a.sortDate);
  }, [stats]);

  const filteredActivity = combinedActivity.filter((item) => {
    if (activityFilter === 'reported') return item.status !== 'claimed';
    if (activityFilter === 'claimed') return item.status === 'claimed';
    return true;
  });

  return (
    <div className="dashboard-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', backdropFilter: 'blur(4px)' }}>
            <Sparkles size={14} style={{ color: '#60a5fa' }} />
            <span>Community Lost & Found Portal</span>
          </div>

          <h1 className="hero-title">
            Lost something important? <br />
            <span style={{ background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              We're here to help reconnect you.
            </span>
          </h1>

          <p className="hero-subtitle">
            Search our centralized registry of recovered belongings or file a quick report in seconds.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary"
              onClick={() => onNavigateToItems()}
            >
              <Search size={18} />
              <span>Browse All Items</span>
            </button>

            <button
              className="btn btn-lost"
              onClick={() => onOpenReportModal('lost')}
            >
              <HelpCircle size={18} />
              <span>I Lost Something</span>
            </button>

            <button
              className="btn btn-found"
              onClick={() => onOpenReportModal('found')}
            >
              <PlusCircle size={18} />
              <span>I Found Something</span>
            </button>
          </div>
        </div>
      </section>

      {/* Loading Skeletons */}
      {loading && (
        <div>
          <div className="stats-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 110 }} />
            ))}
          </div>
          <div className="skeleton" style={{ height: 180, marginBottom: '1.5rem' }} />
          <div className="activity-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 180 }} />
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger-border)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', color: 'var(--danger-text)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>Unable to load dashboard data:</strong> {error}
          </div>
          <button className="btn btn-sm btn-secondary" onClick={loadStats}>
            Retry
          </button>
        </div>
      )}

      {/* Main Dashboard Content */}
      {!loading && stats && (
        <>
          {/* Summary Cards with Icons & Better Layout */}
          <div className="stats-grid">
            {/* Total Reports */}
            <div className="stat-card" onClick={() => onNavigateToItems()} style={{ cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Package size={26} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Reports</span>
                <span className="stat-value">{stats.counts.total}</span>
                <span className="stat-badge" style={{ color: 'var(--primary)' }}>
                  <TrendingUp size={13} />
                  <span>{stats.counts.active} active cases</span>
                </span>
              </div>
            </div>

            {/* Currently Lost */}
            <div className="stat-card" onClick={() => onNavigateToItems({ status: 'lost' })} style={{ cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                <AlertCircle size={26} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Currently Lost</span>
                <span className="stat-value" style={{ color: 'var(--danger)' }}>{stats.counts.lost}</span>
                <span className="stat-badge" style={{ color: 'var(--danger)' }}>
                  <span>Awaiting recovery ({lostPercent}%)</span>
                </span>
              </div>
            </div>

            {/* Found Items */}
            <div className="stat-card" onClick={() => onNavigateToItems({ status: 'found' })} style={{ cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                <CheckCircle2 size={26} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Items Recovered</span>
                <span className="stat-value" style={{ color: 'var(--success)' }}>{stats.counts.found}</span>
                <span className="stat-badge" style={{ color: 'var(--success)' }}>
                  <span>Ready to be claimed ({foundPercent}%)</span>
                </span>
              </div>
            </div>

            {/* Returned to Owner */}
            <div className="stat-card" onClick={() => onNavigateToItems({ status: 'claimed' })} style={{ cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <Sparkles size={26} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Returned to Owner</span>
                <span className="stat-value" style={{ color: '#7c3aed' }}>{stats.counts.claimed}</span>
                <span className="stat-badge" style={{ color: '#7c3aed', fontWeight: 700 }}>
                  <ShieldCheck size={13} />
                  <span>{stats.resolutionRate}% Success Rate</span>
                </span>
              </div>
            </div>
          </div>

          {/* Visual Breakdown & Charts Section */}
          <div className="dashboard-grid-two-col">
            {/* Status Visual Breakdown */}
            <div className="visual-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PieChart size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Item Status Breakdown</h3>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {total} items tracked
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                Proportional distribution across lost, found, and reunited belongings.
              </p>

              {/* Segmented Progress Bar */}
              {total > 0 ? (
                <>
                  <div className="status-bar-container">
                    <div
                      className="status-bar-segment status-bar-lost"
                      style={{ width: `${lostPercent}%` }}
                      title={`Lost: ${stats.counts.lost} (${lostPercent}%)`}
                    />
                    <div
                      className="status-bar-segment status-bar-found"
                      style={{ width: `${foundPercent}%` }}
                      title={`Found: ${stats.counts.found} (${foundPercent}%)`}
                    />
                    <div
                      className="status-bar-segment status-bar-claimed"
                      style={{ width: `${claimedPercent}%` }}
                      title={`Returned: ${stats.counts.claimed} (${claimedPercent}%)`}
                    />
                  </div>

                  {/* Interactive Status Pills */}
                  <div className="status-pills">
                    <div
                      className="status-pill-item"
                      onClick={() => onNavigateToItems({ status: 'lost' })}
                      title="Filter lost items"
                    >
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                      <span>Lost: <strong>{stats.counts.lost}</strong> ({lostPercent}%)</span>
                    </div>

                    <div
                      className="status-pill-item"
                      onClick={() => onNavigateToItems({ status: 'found' })}
                      title="Filter found items"
                    >
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                      <span>Found: <strong>{stats.counts.found}</strong> ({foundPercent}%)</span>
                    </div>

                    <div
                      className="status-pill-item"
                      onClick={() => onNavigateToItems({ status: 'claimed' })}
                      title="Filter returned items"
                    >
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#8b5cf6' }} />
                      <span>Returned: <strong>{stats.counts.claimed}</strong> ({claimedPercent}%)</span>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No items to display.</p>
              )}
            </div>

            {/* Category Visual Distribution Breakdown */}
            <div className="visual-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Category Distribution</h3>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top categories</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                Visual volume breakdown by item classification.
              </p>

              {stats.categories && stats.categories.length > 0 ? (
                <div>
                  {stats.categories.slice(0, 5).map((cat) => {
                    const catPct = total > 0 ? Math.round((cat.total / total) * 100) : 0;
                    return (
                      <div
                        key={cat.category}
                        className="category-bar-row"
                        onClick={() => onNavigateToItems({ category: cat.category })}
                        title={`View ${cat.category} items`}
                      >
                        <div className="category-bar-header">
                          <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{cat.category}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            <strong>{cat.total}</strong> items ({catPct}%)
                          </span>
                        </div>
                        <div className="category-progress-track">
                          {cat.lost > 0 && (
                            <div
                              style={{
                                width: `${(cat.lost / cat.total) * 100}%`,
                                background: '#ef4444',
                                height: '100%'
                              }}
                              title={`Lost: ${cat.lost}`}
                            />
                          )}
                          {cat.found > 0 && (
                            <div
                              style={{
                                width: `${(cat.found / cat.total) * 100}%`,
                                background: '#10b981',
                                height: '100%'
                              }}
                              title={`Found: ${cat.found}`}
                            />
                          )}
                          {cat.claimed > 0 && (
                            <div
                              style={{
                                width: `${(cat.claimed / cat.total) * 100}%`,
                                background: '#8b5cf6',
                                height: '100%'
                              }}
                              title={`Returned: ${cat.claimed}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No categories recorded yet.</p>
              )}
            </div>
          </div>

          {/* Recent Activity List (Latest Reported & Claimed Items) */}
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div>
                <h2 className="section-title">
                  <Clock size={20} style={{ color: 'var(--primary)' }} />
                  <span>Recent Activity Stream</span>
                </h2>
                <p className="section-subtitle">Real-time timeline of newly reported items and successful owner reunions</p>
              </div>

              {/* Activity Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${activityFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', border: 'none' }}
                  onClick={() => setActivityFilter('all')}
                >
                  All Activity
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activityFilter === 'reported' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', border: 'none' }}
                  onClick={() => setActivityFilter('reported')}
                >
                  New Reports
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activityFilter === 'claimed' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', border: 'none' }}
                  onClick={() => setActivityFilter('claimed')}
                >
                  Reunited / Claimed
                </button>
              </div>
            </div>

            {filteredActivity && filteredActivity.length > 0 ? (
              <div className="activity-list">
                {filteredActivity.map((item) => {
                  const isClaimed = item.status === 'claimed';
                  const isLost = item.type === 'lost' && !isClaimed;

                  return (
                    <div
                      key={item._id}
                      className="activity-item"
                      onClick={() => onSelectItem(item._id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Thumbnail or Type Avatar */}
                        {item.image ? (
                          <div className="activity-avatar" style={{ border: '1px solid var(--border-color)' }}>
                            <img
                              src={item.image.startsWith('http') ? item.image : `/uploads/${item.image}`}
                              alt={item.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <div
                            className="activity-avatar"
                            style={{
                              background: isClaimed
                                ? '#f5f3ff'
                                : isLost
                                ? 'var(--danger-light)'
                                : 'var(--success-light)',
                              color: isClaimed
                                ? '#7c3aed'
                                : isLost
                                ? 'var(--danger)'
                                : 'var(--success)'
                            }}
                          >
                            {isClaimed ? (
                              <Sparkles size={20} />
                            ) : isLost ? (
                              <HelpCircle size={20} />
                            ) : (
                              <PlusCircle size={20} />
                            )}
                          </div>
                        )}

                        {/* Details */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-color)' }}>
                              {item.title}
                            </span>
                            {getStatusBadge(item.status)}
                            <span style={{
                              fontSize: '0.75rem',
                              background: 'var(--bg-subtle)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-muted)'
                            }}>
                              {item.category}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <MapPin size={13} />
                              <span>{item.location}</span>
                            </span>

                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Calendar size={13} />
                              <span>{formatDate(item.date)}</span>
                            </span>

                            {isClaimed && item.claimDetails?.claimedBy && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#7c3aed', fontWeight: 600 }}>
                                <CheckCircle size={13} />
                                <span>Claimed by {item.claimDetails.claimedBy}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action & Relative Time */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {getRelativeTime(item.sortDate)}
                        </span>
                        <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '2.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>No activity matching this filter.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
