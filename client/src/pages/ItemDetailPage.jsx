import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  Tag,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Edit3,
  Trash2,
  Share2,
  RefreshCw,
  Printer,
  ShieldCheck,
  Clock,
  Flame,
  Check,
  Lock,
  ExternalLink,
  ChevronRight,
  Package
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function ItemDetailPage({
  itemId,
  onBack,
  onOpenEdit,
  onOpenClaim,
  onItemDeleted,
  onSelectMatchItem,
  onPromptLogin
}) {
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [itemRes, matchesRes] = await Promise.all([
        api.getItemById(itemId),
        api.getItemMatches(itemId).catch(() => ({ success: false, data: [] }))
      ]);

      if (itemRes.success) {
        setItem(itemRes.data);
      } else {
        throw new Error(itemRes.message || 'Failed to fetch item details');
      }

      if (matchesRes.success) {
        setMatches(matchesRes.data || []);
      }
    } catch (err) {
      console.error('Error loading item details:', err);
      setError(err.message || 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      loadItemDetails();
    }
  }, [itemId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyShare = () => {
    if (!item) return;
    const text = `FindNest Report: ${item.title} (${item.type?.toUpperCase()}) - Category: ${item.category}, Location: ${item.location}. Contact: ${item.reporterContact}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    toast.info('Item details copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!isAuthenticated) {
      toast.warning('🔒 Staff login required to delete item reports.');
      if (onPromptLogin) onPromptLogin();
      return;
    }

    try {
      setDeleting(true);
      const res = await api.deleteItem(itemId);
      if (res.success) {
        toast.info('Item report removed from active directory.');
        if (onItemDeleted) onItemDeleted(itemId);
        if (onBack) onBack();
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'lost':
        return <span className="badge badge-lost"><AlertCircle size={13} /> Lost Report</span>;
      case 'found':
        return <span className="badge badge-found"><CheckCircle2 size={13} /> Found Item</span>;
      case 'claimed':
        return <span className="badge badge-claimed"><Sparkles size={13} /> Returned to Owner</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>
            <Flame size={13} />
            <span>High Urgency</span>
          </span>
        );
      case 'low':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-subtle)', color: 'var(--text-muted)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>Low Priority</span>
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>Standard Priority</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: 960, margin: '2rem auto', padding: '1rem' }}>
        <div className="skeleton" style={{ height: 40, width: 140, marginBottom: '1.5rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
          <div>
            <div className="skeleton" style={{ height: 48, marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: 100, marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: 140 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="page-container" style={{ maxWidth: 640, margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <AlertCircle size={44} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Item Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {error || 'The requested item report could not be found or has been removed.'}
          </p>
          <button className="btn btn-primary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Return to Directory</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 1040, margin: '1rem auto 3rem' }}>
      {/* Top Breadcrumb / Back Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Items</span>
        </button>

        {/* Action Buttons Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopyShare}
            title="Copy Report Details"
          >
            {copied ? <Check size={15} style={{ color: 'var(--success)' }} /> : <Share2 size={15} />}
            <span>{copied ? 'Copied Link!' : 'Share'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrint}
            title="Print Report"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (!isAuthenticated) {
                toast.warning('🔒 Staff login required to edit reports.');
                if (onPromptLogin) onPromptLogin();
                return;
              }
              if (onOpenEdit) onOpenEdit(item);
            }}
          >
            {!isAuthenticated ? <Lock size={14} style={{ color: 'var(--primary)' }} /> : <Edit3 size={15} />}
            <span>Edit {!isAuthenticated && '(Staff)'}</span>
          </button>

          {item.status !== 'claimed' && (
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.warning('🔒 Staff login required to process claims.');
                  if (onPromptLogin) onPromptLogin();
                  return;
                }
                if (onOpenClaim) onOpenClaim(item);
              }}
            >
              {!isAuthenticated ? <Lock size={14} /> : <CheckCircle2 size={15} />}
              <span>Mark Returned / Claimed {!isAuthenticated && '(Staff)'}</span>
            </button>
          )}

          {confirmDelete ? (
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <button
                className="btn btn-lost btn-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete?'}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="btn btn-danger-outline btn-sm"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.warning('🔒 Staff login required to delete item reports.');
                  if (onPromptLogin) onPromptLogin();
                  return;
                }
                setConfirmDelete(true);
              }}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Image, Badges, Tags & Smart Matches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Image / Thumbnail Card */}
          <div className="card" style={{ padding: '1rem', textAlign: 'center', overflow: 'hidden' }}>
            {item.image ? (
              <div style={{ width: '100%', height: 280, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-subtle)' }}>
                <img
                  src={item.image.startsWith('http') ? item.image : `/uploads/${item.image}`}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div style={{
                height: 220,
                borderRadius: 'var(--radius-md)',
                background: item.type === 'lost' ? 'rgba(239, 68, 68, 0.06)' : 'rgba(16, 185, 129, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <Package size={48} style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.85rem' }}>No photo uploaded</span>
              </div>
            )}

            {/* Badges Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {getStatusBadge(item.status)}
              {getPriorityBadge(item.priority)}
            </div>
          </div>

          {/* Tags Section */}
          {item.tags && item.tags.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                <Tag size={16} style={{ color: 'var(--primary)' }} />
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Item Tags & Keywords</h4>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      color: 'var(--text-color)',
                      fontWeight: 600
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Smart Match Suggestions */}
          {matches && matches.length > 0 && (
            <div className="card" style={{ padding: '1.25rem', border: '1px solid #c7d2fe', background: '#f8faff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Smart Match Suggestions ({matches.length})
                </h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.85rem 0' }}>
                Potential corresponding {item.type === 'lost' ? 'found' : 'lost'} records detected by FindNest:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {matches.slice(0, 3).map((match) => (
                  <div
                    key={match.item._id}
                    onClick={() => {
                      if (onSelectMatchItem) onSelectMatchItem(match.item._id);
                    }}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border-color)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>
                        {match.item.title}
                      </strong>
                      <span style={{
                        background: match.score >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: match.score >= 80 ? '#059669' : '#d97706',
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 700
                      }}>
                        {match.score}% Match
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={12} />
                      <span>{match.item.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Full Information Details & History Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Info Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div>
                <span style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: 'var(--primary)',
                  marginBottom: '0.35rem',
                  display: 'block'
                }}>
                  {item.category}
                </span>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
                  {item.title}
                </h1>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Report ID:</span> <code style={{ fontSize: '0.8rem' }}>{item._id}</code>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                Description & Identifiers
              </h4>
              <p style={{
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: 'var(--text-color)',
                background: 'var(--bg-subtle)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                margin: 0,
                whiteSpace: 'pre-line'
              }}>
                {item.description}
              </p>
            </div>

            {/* Location & Date Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                    Location {item.type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-color)' }}>
                    {item.location}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                    Date {item.type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-color)' }}>
                    {formatDate(item.date)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Reporter Contact Info */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Reporter Information
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 600 }}>
                    {item.reporterName}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                    {item.reporterContact}
                  </span>
                </div>
              </div>
            </div>

            {/* Claimant Record if Claimed */}
            {item.status === 'claimed' && item.claimDetails && (
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid #ddd6fe', paddingTop: '1.25rem', background: '#faf5ff', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <ShieldCheck size={18} style={{ color: '#7c3aed' }} />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#6b21a8' }}>
                    Resolution & Handover Record
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#7c3aed', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Claimed By:</span>
                    <strong>{item.claimDetails.claimedBy || 'Verified Owner'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#7c3aed', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Contact Info:</span>
                    <span>{item.claimDetails.claimantContact || 'N/A'}</span>
                  </div>

                  <div>
                    <span style={{ color: '#7c3aed', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Resolution Date:</span>
                    <span>{formatDate(item.claimDetails.claimedDate || item.updatedAt)}</span>
                  </div>
                </div>

                {item.claimDetails.notes && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#581c87', fontStyle: 'italic' }}>
                    Notes: "{item.claimDetails.notes}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity / Status History Timeline */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                Activity & Status History
              </h3>
            </div>

            {item.history && item.history.length > 0 ? (
              <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)', marginLeft: '0.5rem' }}>
                {item.history.map((event, idx) => {
                  const isClaimedEvent = event.action === 'Claimed';
                  const isReportedEvent = event.action === 'Reported';

                  return (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        marginBottom: idx === item.history.length - 1 ? 0 : '1.5rem'
                      }}
                    >
                      {/* Timeline Dot */}
                      <div style={{
                        position: 'absolute',
                        left: '-1.85rem',
                        top: 2,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: isClaimedEvent ? '#8b5cf6' : isReportedEvent ? 'var(--primary)' : '#059669',
                        border: '2px solid #fff',
                        boxShadow: '0 0 0 2px var(--border-color)'
                      }} />

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                            {event.action}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            • {formatTimestamp(event.timestamp)}
                          </span>
                        </div>

                        <p style={{ margin: '0.25rem 0 0.15rem 0', fontSize: '0.85rem', color: 'var(--text-color)' }}>
                          {event.description}
                        </p>

                        {event.performedBy && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            By: <em>{event.performedBy}</em>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Reported on {formatDate(item.createdAt || item.date)}. No further activity recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
