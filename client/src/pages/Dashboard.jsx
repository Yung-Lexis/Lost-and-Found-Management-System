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
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ onNavigateToItems, onOpenReportModal, onSelectItem }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <div className="skeleton" style={{ height: 40, width: '40%', marginBottom: '1.5rem' }} />
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

      {/* Metrics Section */}
      {!loading && stats && (
        <>
          <div className="stats-grid">
            {/* Total Items */}
            <div className="stat-card" onClick={() => onNavigateToItems()} style={{ cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Package size={26} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Reports</span>
                <span className="stat-value">{stats.counts.total}</span>
                <span className="stat-badge">
                  <TrendingUp size={13} style={{ color: 'var(--primary)' }} />
                  <span>All time recorded</span>
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
                <span className="stat-badge">
                  <span>Awaiting recovery</span>
                </span>
              </div>
            </div>

            {/* Found Items */}
            <div className="stat-card" onClick={() => onNavigateToItems({ status: 'found' })} style={{ cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                <CheckCircle2 size={26} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Items Found</span>
                <span className="stat-value" style={{ color: 'var(--success)' }}>{stats.counts.found}</span>
                <span className="stat-badge">
                  <span>Ready to be claimed</span>
                </span>
              </div>
            </div>

            {/* Claimed / Returned */}
            <div className="stat-card" onClick={() => onNavigateToItems({ status: 'claimed' })} style={{ cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <Sparkles size={26} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Returned to Owner</span>
                <span className="stat-value" style={{ color: '#7c3aed' }}>{stats.counts.claimed}</span>
                <span className="stat-badge" style={{ color: '#059669', fontWeight: 700 }}>
                  <span>{stats.resolutionRate}% Resolution Rate</span>
                </span>
              </div>
            </div>
          </div>

          {/* Category Quick Filters */}
          {stats.categories && stats.categories.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div className="section-header">
                <div>
                  <h2 className="section-title">
                    <Package size={20} style={{ color: 'var(--primary)' }} />
                    <span>Popular Categories</span>
                  </h2>
                  <p className="section-subtitle">Click any category to view reports</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                {stats.categories.map((cat) => (
                  <button
                    key={cat.category}
                    className="badge badge-category"
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.15s ease' }}
                    onClick={() => onNavigateToItems({ category: cat.category })}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cat.category}</span>
                    <span style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem' }}>
                      {cat.total}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Reports Section */}
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <Clock size={20} style={{ color: 'var(--primary)' }} />
                  <span>Recently Reported Items</span>
                </h2>
                <p className="section-subtitle">Latest lost and found submissions</p>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigateToItems()}
              >
                <span>View All Items</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {stats.recentItems && stats.recentItems.length > 0 ? (
              <div className="activity-grid">
                {stats.recentItems.map((item) => (
                  <div
                    key={item._id}
                    className="item-card"
                    onClick={() => onSelectItem(item._id)}
                  >
                    <div>
                      <div className="item-card-header">
                        <span className="item-card-title">{item.title}</span>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="item-card-meta">
                        <div className="meta-row">
                          <Package size={14} />
                          <span>{item.category}</span>
                        </div>
                        <div className="meta-row">
                          <MapPin size={14} />
                          <span>{item.location}</span>
                        </div>
                        <div className="meta-row">
                          <Calendar size={14} />
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', background: 'white', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-strong)' }}>
                <p>No items reported yet. Be the first to report a lost or found item!</p>
              </div>
            )}
          </div>

          {/* Recent Resolutions Section */}
          {stats.recentClaimed && stats.recentClaimed.length > 0 && (
            <div>
              <div className="section-header">
                <div>
                  <h2 className="section-title">
                    <Sparkles size={20} style={{ color: '#7c3aed' }} />
                    <span>Recent Reconnections & Returns</span>
                  </h2>
                  <p className="section-subtitle">Items successfully returned to their rightful owners</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {stats.recentClaimed.map((claimed) => (
                  <div
                    key={claimed._id}
                    style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 'var(--radius-lg)', padding: '1.15rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <CheckCircle2 size={16} style={{ color: '#7c3aed' }} />
                      <strong style={{ fontSize: '0.95rem', color: '#4c1d95' }}>{claimed.title}</strong>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#6d28d9', marginBottom: '0.5rem' }}>
                      Claimed by: <strong>{claimed.claimDetails?.claimedBy || 'Verified Owner'}</strong>
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#8b5cf6', display: 'block' }}>
                      Location: {claimed.location}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
