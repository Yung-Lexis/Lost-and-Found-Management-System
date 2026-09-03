import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Edit3, 
  Camera, 
  Upload, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  FileText, 
  AlertCircle,
  Loader2,
  CheckCircle2
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

export default function EditItemModal({ item, onClose, onSuccess }) {
  const toast = useToast();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [formData, setFormData] = useState({
    title: item?.title || '',
    category: item?.category || 'Electronics',
    type: item?.type || 'lost',
    status: item?.status || 'lost',
    description: item?.description || '',
    location: item?.location || '',
    date: item?.date ? new Date(item.date).toISOString().split('T')[0] : '',
    reporterName: item?.reporterName || '',
    reporterContact: item?.reporterContact || ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.image || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      })
      .catch((err) => console.warn('Categories fallback in edit:', err.message));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, WEBP)');
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
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const submissionData = new FormData();
      submissionData.append('title', formData.title.trim());
      submissionData.append('category', formData.category);
      submissionData.append('type', formData.type);
      submissionData.append('status', formData.status);
      submissionData.append('description', formData.description.trim());
      submissionData.append('location', formData.location.trim());
      submissionData.append('date', formData.date);
      submissionData.append('reporterName', formData.reporterName.trim());
      submissionData.append('reporterContact', formData.reporterContact.trim());

      if (imageFile) {
        submissionData.append('image', imageFile);
      } else if (!imagePreview) {
        submissionData.append('image', '');
      }

      const res = await api.updateItem(item._id, submissionData);

      if (res.success) {
        toast.success('✓ Item report updated successfully!');
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update item:', err);
      setError(err.message || 'Failed to update item details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit3 size={18} />
            </div>
            <span>Edit Item Report</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger-border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--danger-text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form id="edit-item-form" onSubmit={handleSubmit} className="form-grid">
            <div className="form-group form-full">
              <label className="form-label" htmlFor="edit-title">
                <span>Item Name / Title</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="edit-title"
                name="title"
                type="text"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-category">
                <span>Category</span>
                <span className="required-star">*</span>
              </label>
              <select
                id="edit-category"
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

            <div className="form-group">
              <label className="form-label" htmlFor="edit-status">
                <span>Status</span>
                <span className="required-star">*</span>
              </label>
              <select
                id="edit-status"
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="lost">Lost</option>
                <option value="found">Found</option>
                <option value="claimed">Claimed / Returned</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-date">
                <Calendar size={14} />
                <span>Date</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="edit-date"
                name="date"
                type="date"
                className="form-control"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-location">
                <MapPin size={14} />
                <span>Location</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="edit-location"
                name="location"
                type="text"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label" htmlFor="edit-description">
                <FileText size={14} />
                <span>Description</span>
                <span className="required-star">*</span>
              </label>
              <textarea
                id="edit-description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-reporterName">
                <User size={14} />
                <span>Reporter Name</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="edit-reporterName"
                name="reporterName"
                type="text"
                className="form-control"
                value={formData.reporterName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-reporterContact">
                <Phone size={14} />
                <span>Reporter Contact</span>
                <span className="required-star">*</span>
              </label>
              <input
                id="edit-reporterContact"
                name="reporterContact"
                type="text"
                className="form-control"
                value={formData.reporterContact}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">
                <Camera size={14} />
                <span>Item Photo</span>
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
                  <img src={imagePreview} alt="Item" className="upload-preview-img" />
                  <button type="button" className="remove-img-btn" onClick={handleRemoveImage}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={24} style={{ color: 'var(--primary)', margin: '0 auto 0.5rem', display: 'block' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Upload / change photo</p>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" form="edit-item-form" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="spin-animation" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
