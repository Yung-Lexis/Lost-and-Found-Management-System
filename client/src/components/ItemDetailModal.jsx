import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Calendar,
  MapPin,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Edit3,
  Trash2,
  Share2,
  RefreshCw,
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ItemDetailModal({
  itemId,
  onClose,
  onOpenEdit,
  onOpenClaim,
  onItemDeleted,
  onSelectMatchItem
}) {
  const toast = useToast();
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
        api.getItemMatches(itemId).catch(() => ({ data: [] }))
      ]);

      if (itemRes.success) {
        setItem(itemRes.data);
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

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await api.deleteItem(itemId);
      if (res.success) {
        toast.info('Item report removed from active directory.');
        onItemDeleted(itemId);
        onClose();
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyShare = () => {
    if (!item) return;
    const text = `FindNest Report: ${item.title} (${item.type.toUpperCase()}) - ${item.category} at ${item.location}. Contact: ${item.reporterContact}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    toast.info('Item details copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>Report Details</span>
            {item && (
              item.status === 'lost' ? (
                <span className="badge badge-lost"><AlertCircle size={12} /> Lost</span>
              ) : item.status === 'found' ? (
                <span className="badge badge-found"><CheckCircle2 size={12} /> Found</span>
              ) : (
                <span className="badge badge-claimed"><Sparkles size={12} /> Returned</span>
              )
            )}
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {loading && (
            <div>
              <div className="skeleton" style={{ height: 200, marginBottom: '1rem' }} />
              <div className="skeleton" style={{ height: 32, width: '70%', marginBottom: '1rem' }} />
              <div className="skeleton" style={{ height: 90, marginBottom: '1rem' }} />
              <div className="skeleton" style={{ height: 70 }} />
            </div>
          )}

          {error && !loading && (
            <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger-border)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--danger-text)' }}>
              {error}
            </div>
          )}

          {!loading && item && (
            <div>
              {/* Optional Photo */}
              {item.image && (
                <div style={{ maxHeight: 280, borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem', background: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ maxHeight: 280, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}

              {/* Title & Category */}
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.25 }}>
                {item.title}
              </h2>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span className="badge badge-category" style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}>
                  <Package size={13} />
                  <span>{item.category}</span>
                </span>
                <span className="badge badge-category" style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}>
                  <MapPin size={13} />
                  <span>{item.location}</span>
                </span>
                <span className="badge badge-category" style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}>
                  <Calendar size={13} />
                  <span>{formatDate(item.date)}</span>
                </span>
              </div>

              {/* Description Card */}
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Item Description
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {item.description}
                </p>
              </div>

              {/* Reporter Contact Info */}
              <div style={{ background: 'var(--primary-light)', border: '1px solid #bfdbfe', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-dark)', marginBottom: '0.65rem' }}>
                  Reported By
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.925rem', color: 'var(--text-main)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <User size={16} style={{ color: 'var(--primary)' }} />
                    <strong>{item.reporterName}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Phone size={16} style={{ color: 'var(--primary)' }} />
                    <span>{item.reporterContact}</span>
                  </div>
                </div>
              </div>

              {/* Claimed Details (if item is already claimed) */}
              {item.status === 'claimed' && item.claimDetails && (
                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Sparkles size={18} style={{ color: '#7c3aed' }} />
                    <strong style={{ color: '#5b21b6' }}>Claim / Resolution Details</strong>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#4c1d95', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div>Claimed by: <strong>{item.claimDetails.claimedBy || 'Verified Owner'}</strong></div>
                    {item.claimDetails.claimantContact && (
                      <div>Contact: {item.claimDetails.claimantContact}</div>
                    )}
                    {item.claimDetails.claimedDate && (
                      <div>Date Claimed: {formatDate(item.claimDetails.claimedDate)}</div>
                    )}
                    {item.claimDetails.notes && (
                      <div style={{ marginTop: '0.35rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.6)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        "{item.claimDetails.notes}"
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Smart Match Suggestions Section */}
              {matches && matches.length > 0 && item.status !== 'claimed' && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Flame size={18} style={{ color: '#d97706' }} />
                    <strong style={{ color: '#92400e', fontSize: '0.95rem' }}>
                      Potential Match Suggestion ({matches.length} found)
                    </strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {matches.slice(0, 3).map((m) => (
                      <div
                        key={m.item._id}
                        style={{ background: 'white', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <strong style={{ fontSize: '0.925rem' }}>{m.item.title}</strong>
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
                              {m.score}% Match
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {m.reasons.join(' • ')}
                          </p>
                        </div>

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            if (onSelectMatchItem) {
                              onSelectMatchItem(m.item._id);
                            }
                          }}
                        >
                          <span>Compare</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        {!loading && item && (
          <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleCopyShare}>
                {copied ? <Check size={15} style={{ color: 'var(--success)' }} /> : <Share2 size={15} />}
                <span>{copied ? 'Copied Link!' : 'Share Info'}</span>
              </button>

              {confirmDelete ? (
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <button className="btn btn-lost btn-sm" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting...' : 'Confirm Delete?'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="btn btn-danger-outline btn-sm" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  onOpenEdit(item);
                }}
              >
                <Edit3 size={16} />
                <span>Edit Report</span>
              </button>

              {item.status !== 'claimed' && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    onOpenClaim(item);
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Mark Returned / Claimed</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
