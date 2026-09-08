import React, { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle, 
  PlusCircle, 
  Camera, 
  Upload, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const DEFAULT_CATEGORIES = [
  'Electronics',
  'Wallets & Purses',
  'Keys',
  'Documents & IDs',
  'Jewelry & Watches',
  'Clothing & Accessories',
  'Bags & Luggage',
  'Books & Stationery',
  'Cards & Badges',
  'Pets',
  'Other'
];

export default function ReportPage({ initialType = 'lost', onSuccess, onCancel }) {
  const toast = useToast();
  const [type, setType] = useState(initialType);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    reporterName: '',
    reporterContact: '',
    priority: 'medium',
    tags: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
          setFormData((prev) => ({ ...prev, category: res.data[0] }));
        }
      })
      .catch((err) => console.warn('Using default categories fallback:', err.message));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!formData.title.trim()) {
      setError('Please provide an item title/name.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Please specify where the item was lost or found.');
      return;
    }
    if (!formData.reporterName.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!formData.reporterContact.trim()) {
      setError('Please provide a contact phone or email.');
      return;
    }

    setSubmitting(true);

    try {
      const submissionData = new FormData();
      submissionData.append('title', formData.title.trim());
      submissionData.append('type', type);
      submissionData.append('category', formData.category);
      submissionData.append('description', formData.description.trim());
      submissionData.append('location', formData.location.trim());
      submissionData.append('date', formData.date);
      submissionData.append('reporterName', formData.reporterName.trim());
      submissionData.append('reporterContact', formData.reporterContact.trim());
      submissionData.append('priority', formData.priority);
      submissionData.append('tags', formData.tags.trim());

      if (imageFile) {
        submissionData.append('image', imageFile);
      }

      const res = await api.createItem(submissionData);

      if (res.success) {
        toast.success(`✓ ${type === 'lost' ? 'Lost' : 'Found'} report filed successfully!`);
        setSuccessMessage(`✓ ${type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`);
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data);
        }, 800);
      }
    } catch (err) {
      console.error('Failed to submit report:', err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            {onCancel && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onCancel}
                style={{ padding: '0.4rem 0.6rem' }}
                title="Go back"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <h1 className="page-title" style={{ fontSize: '1.6rem', margin: 0 }}>
              Report Lost or Found Item
            </h1>
          </div>
          <p className="page-subtitle" style={{ marginLeft: onCancel ? '2.5rem' : 0 }}>
            Submit details to register an item into the centralized Lost & Found directory.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {/* Lost vs. Found Switcher */}
        <div className="type-toggle-group" style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={`type-toggle-btn ${type === 'lost' ? 'active-lost' : ''}`}
            onClick={() => setType('lost')}
          >
            <HelpCircle size={18} />
            <span>I Lost Something</span>
          </button>

          <button
            type="button"
            className={`type-toggle-btn ${type === 'found' ? 'active-found' : ''}`}
            onClick={() => setType('found')}
          >
            <PlusCircle size={18} />
            <span>I Found Something</span>
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div style={{ background: 'var(--success-light)', border: '1px solid var(--success-border)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--success-text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
            <CheckCircle2 size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger-border)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--danger-text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form id="report-item-page-form" onSubmit={handleSubmit} className="form-grid">
          {/* Title */}
          <div className="form-group form-full">
            <label className="form-label" htmlFor="page-title">
              <span>Item Name / Title</span>
              <span className="required-star">*</span>
            </label>
            <input
              id="page-title"
              name="title"
              type="text"
              className="form-control"
              placeholder="e.g., Black Leather Bifold Wallet, Space Gray AirPods..."
              value={formData.title}
              onChange={handleChange}
              maxLength={120}
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="page-category">
              <span>Category</span>
              <span className="required-star">*</span>
            </label>
            <select
              id="page-category"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="page-date">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} />
                <span>Date {type === 'lost' ? 'Lost' : 'Found'}</span>
              </span>
              <span className="required-star">*</span>
            </label>
            <input
              id="page-date"
              name="date"
              type="date"
              className="form-control"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Location */}
          <div className="form-group form-full">
            <label className="form-label" htmlFor="page-location">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={14} />
                <span>Location {type === 'lost' ? 'Lost' : 'Found'}</span>
              </span>
              <span className="required-star">*</span>
            </label>
            <input
              id="page-location"
              name="location"
              type="text"
              className="form-control"
              placeholder="e.g., Library 2nd Floor, Main Cafeteria, Bus Stop #4..."
              value={formData.location}
              onChange={handleChange}
              maxLength={150}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group form-full">
            <label className="form-label" htmlFor="page-description">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FileText size={14} />
                <span>Description & Distinct Features</span>
              </span>
            </label>
            <textarea
              id="page-description"
              name="description"
              className="form-control"
              rows={3}
              placeholder="Include color, brand, stickers, scratches, or any unique identifiers that help prove ownership..."
              value={formData.description}
              onChange={handleChange}
              maxLength={1000}
            />
          </div>

          {/* Priority / Urgency */}
          <div className="form-group">
            <label className="form-label" htmlFor="page-priority">
              <span>Priority / Urgency Level</span>
            </label>
            <select
              id="page-priority"
              name="priority"
              className="form-control"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Standard Priority</option>
              <option value="high">High Urgency / Critical Item</option>
            </select>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label" htmlFor="page-tags">
              <span>Tags / Keywords (comma separated)</span>
            </label>
            <input
              id="page-tags"
              name="tags"
              type="text"
              className="form-control"
              placeholder="e.g. wallet, leather, black, id card"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          {/* Photo Upload */}
          <div className="form-group form-full">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Camera size={14} />
                <span>Item Photo (Optional)</span>
              </span>
            </label>

            {imagePreview ? (
              <div style={{ position: 'relative', width: 140, height: 140, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                <img
                  src={imagePreview}
                  alt="Item Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: 'rgba(239, 68, 68, 0.85)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg-subtle)',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.4rem' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)' }}>
                  Click to upload a photo
                </p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  PNG, JPG, or WEBP up to 5MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* Reporter Contact Info */}
          <div className="form-group">
            <label className="form-label" htmlFor="page-reporterName">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} />
                <span>Your Name</span>
              </span>
              <span className="required-star">*</span>
            </label>
            <input
              id="page-reporterName"
              name="reporterName"
              type="text"
              className="form-control"
              placeholder="e.g., Alex Johnson"
              value={formData.reporterName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="page-reporterContact">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={14} />
                <span>Contact Email or Phone</span>
              </span>
              <span className="required-star">*</span>
            </label>
            <input
              id="page-reporterContact"
              name="reporterContact"
              type="text"
              className="form-control"
              placeholder="e.g., alex@example.com or 555-0199"
              value={formData.reporterContact}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Action */}
          <div className="form-group form-full" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            {onCancel && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className={`btn ${type === 'lost' ? 'btn-lost' : 'btn-found'}`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Submitting Report...</span>
                </>
              ) : (
                <>
                  {type === 'lost' ? <HelpCircle size={16} /> : <PlusCircle size={16} />}
                  <span>Submit {type === 'lost' ? 'Lost' : 'Found'} Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
