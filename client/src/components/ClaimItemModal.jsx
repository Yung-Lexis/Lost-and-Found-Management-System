import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Phone, 
  FileText, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ClaimItemModal({ item, onClose, onSuccess }) {
  const toast = useToast();
  const [claimedBy, setClaimedBy] = useState('');
  const [claimantContact, setClaimantContact] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!claimedBy.trim()) {
      setError('Please provide the name of the person claiming the item');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await api.updateItemStatus(item._id, {
        status: 'claimed',
        claimedBy: claimedBy.trim(),
        claimantContact: claimantContact.trim(),
        notes: notes.trim()
      });

      if (res.success) {
        toast.success(`🎉 Item marked as successfully returned to ${claimedBy.trim()}!`);
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update status to claimed:', err);
      setError(err.message || 'Failed to mark item as claimed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <span>Mark as Returned / Claimed</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Confirm that <strong>"{item?.title}"</strong> has been successfully returned or claimed by its owner.
          </p>

          {error && (
            <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger-border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--danger-text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form id="claim-form" onSubmit={handleSubmit} className="form-grid">
            <div className="form-group form-full">
              <label className="form-label" htmlFor="claimedBy">
                <User size={14} />
                <span>Claimant / Owner Full Name</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="claimedBy"
                type="text"
                className="form-control"
                placeholder="e.g., Alex Morgan"
                value={claimedBy}
                onChange={(e) => setClaimedBy(e.target.value)}
                required
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label" htmlFor="claimantContact">
                <Phone size={14} />
                <span>Claimant Contact Info (Optional)</span>
              </label>
              <input
                id="claimantContact"
                type="text"
                className="form-control"
                placeholder="e.g., alex.m@example.com / (555) 234-5678"
                value={claimantContact}
                onChange={(e) => setClaimantContact(e.target.value)}
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label" htmlFor="notes">
                <FileText size={14} />
                <span>Verification / Handover Notes (Optional)</span>
              </label>
              <textarea
                id="notes"
                className="form-control"
                placeholder="e.g., Verified student ID / unlocked device on spot..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="submit"
            form="claim-form"
            className="btn btn-success"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="spin-animation" />
                <span>Confirming...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Confirm Return & Claim</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
