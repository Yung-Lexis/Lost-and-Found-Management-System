import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
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
  Loader2
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

export default function ReportModal({ initialType = 'lost', onClose, onSuccess }) {
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
    reporterContact: ''
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
    // Fetch categories dynamically
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

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, WEBP, GIF)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!formData.title.trim()) {
      setError('Please provide an item name or title');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a brief description of the item');
      return;
    }
    if (!formData.location.trim()) {
      setError('Please specify where the item was lost or found');
      return;
    }
    if (!formData.reporterName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.reporterContact.trim()) {
      setError('Please provide a contact phone number or email address');
      return;
    }

    try {
      setSubmitting(true);

      const submissionData = new FormData();
      submissionData.append('title', formData.title.trim());
      submissionData.append('type', type);
      submissionData.append('category', formData.category);
      submissionData.append('description', formData.description.trim());
      submissionData.append('location', formData.location.trim());
      submissionData.append('date', formData.date);
      submissionData.append('reporterName', formData.reporterName.trim());
      submissionData.append('reporterContact', formData.reporterContact.trim());

      if (imageFile) {
        submissionData.append('image', imageFile);
      }

      const res = await api.createItem(submissionData);

      if (res.success) {
        toast.success(`✓ ${type === 'lost' ? 'Lost' : 'Found'} report filed successfully!`);
        setSuccessMessage(`✓ ${type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`);
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data);
          onClose();
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            {type === 'lost' ? (
              <>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HelpCircle size={20} />
                </div>
                <span>Report a Lost Item</span>
              </>
            ) : (
              <>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlusCircle size={20} />
                </div>
                <span>Report a Found Item</span>
              </>
            )}
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Lost vs. Found Switcher */}
          <div className="type-toggle-group">
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

          <form id="report-item-form" onSubmit={handleSubmit} className="form-grid">
            {/* Title */}
            <div className="form-group form-full">
              <label className="form-label" htmlFor="title">
                <span>Item Name / Title</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="title"
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
              <label className="form-label" htmlFor="category">
                <span>Category</span>
                <span className="required-star">*</span>
              </label>
              <select
                id="category"
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
              <label className="form-label" htmlFor="date">
                <Calendar size={14} />
                <span>Date {type === 'lost' ? 'Lost' : 'Found'}</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="date"
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
              <label className="form-label" htmlFor="location">
                <MapPin size={14} />
                <span>Location {type === 'lost' ? 'Last Seen / Lost' : 'Found'}</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className="form-control"
                placeholder="e.g., Central Library 2nd Floor Study Desk, Student Cafeteria..."
                value={formData.location}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group form-full">
              <label className="form-label" htmlFor="description">
                <FileText size={14} />
                <span>Detailed Description</span>
                <span className="required-star">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                placeholder="Describe distinctive marks, brand, color, scratches, stickers, or contents..."
                value={formData.description}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                required
              />
            </div>

            {/* Reporter Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reporterName">
                <User size={14} />
                <span>Your Full Name</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="reporterName"
                name="reporterName"
                type="text"
                className="form-control"
                placeholder="e.g., Alex Morgan"
                value={formData.reporterName}
                onChange={handleChange}
                maxLength={80}
                required
              />
            </div>

            {/* Reporter Contact */}
            <div className="form-group">
              <label className="form-label" htmlFor="reporterContact">
                <Phone size={14} />
                <span>Contact Phone / Email</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="reporterContact"
                name="reporterContact"
                type="text"
                className="form-control"
                placeholder="e.g., alex.m@example.com or (555) 019-2834"
                value={formData.reporterContact}
                onChange={handleChange}
                maxLength={120}
                required
              />
            </div>

            {/* Photo Upload Zone */}
            <div className="form-group form-full">
              <label className="form-label">
                <Camera size={14} />
                <span>Item Photo (Optional)</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageSelect}
              />

              {imagePreview ? (
                <div className="upload-preview-wrapper">
                  <img src={imagePreview} alt="Item preview" className="upload-preview-img" />
                  <button
                    type="button"
                    className="remove-img-btn"
                    onClick={handleRemoveImage}
                    title="Remove Photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={28} style={{ color: 'var(--primary)', margin: '0 auto 0.5rem', display: 'block' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Click to upload a photo of the item
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    JPG, PNG, WEBP up to 5MB
                  </span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="report-item-form"
            className={`btn ${type === 'lost' ? 'btn-lost' : 'btn-found'}`}
            disabled={submitting || Boolean(successMessage)}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="spin-animation" />
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
      </div>
    </div>
  );
}
