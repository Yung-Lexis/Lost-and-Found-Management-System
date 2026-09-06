import React, { useState } from 'react';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Compass,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage({ onSuccess, onCancel }) {
  const { login, register } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleQuickDemo = (email, password) => {
    setFormData((prev) => ({
      ...prev,
      email,
      password
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!formData.name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match. Please check again.');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        const loggedUser = await login(formData.email.trim(), formData.password);
        toast.success(`Welcome back, ${loggedUser.name}!`);
      } else {
        const newUser = await register(
          formData.name.trim(),
          formData.email.trim(),
          formData.password,
          'staff'
        );
        toast.success(`Account registered! Welcome, ${newUser.name}.`);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 480, margin: '1.5rem auto' }}>
      <div className="card" style={{ padding: '2.25rem' }}>
        {/* Back Link */}
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            style={{ marginBottom: '1.25rem', padding: '0.35rem 0.65rem' }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        )}

        {/* Brand & Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
          }}>
            <Compass size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-color)' }}>
            {mode === 'login' ? 'Staff Portal Login' : 'Register Staff Account'}
          </h1>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {mode === 'login'
              ? 'Sign in to access staff tools (claim verification, report editing & item management).'
              : 'Create a staff account to manage lost & found records.'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="type-toggle-group" style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={`type-toggle-btn ${mode === 'login' ? 'active-lost' : ''}`}
            onClick={() => { setMode('login'); setError(null); }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${mode === 'register' ? 'active-found' : ''}`}
            onClick={() => { setMode('register'); setError(null); }}
          >
            <UserPlus size={16} />
            <span>Register</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'var(--danger-light)',
            border: '1px solid var(--danger-border)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger-text)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="form-grid">
          {mode === 'register' && (
            <div className="form-group form-full">
              <label className="form-label" htmlFor="auth-name">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={14} />
                  <span>Full Name</span>
                </span>
                <span className="required-star">*</span>
              </label>
              <input
                id="auth-name"
                name="name"
                type="text"
                className="form-control"
                placeholder="e.g. Officer Davis"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group form-full">
            <label className="form-label" htmlFor="auth-email">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={14} />
                <span>Email Address</span>
              </span>
              <span className="required-star">*</span>
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              className="form-control"
              placeholder="e.g. staff@findnest.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group form-full">
            <label className="form-label" htmlFor="auth-password">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={14} />
                <span>Password</span>
              </span>
              <span className="required-star">*</span>
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group form-full">
              <label className="form-label" htmlFor="auth-confirmPassword">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Lock size={14} />
                  <span>Confirm Password</span>
                </span>
                <span className="required-star">*</span>
              </label>
              <input
                id="auth-confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>
          )}

          <div className="form-group form-full" style={{ marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>{mode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
                  <span>{mode === 'login' ? 'Sign In as Staff' : 'Create Staff Account'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Demo Fill Buttons for effortless testing */}
        {mode === 'login' && (
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' }}>
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Quick Demo Credentials
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo('staff@findnest.com', 'password123')}
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
              >
                <ShieldCheck size={14} /> Staff (staff@findnest.com)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo('admin@findnest.com', 'password123')}
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
              >
                <ShieldCheck size={14} /> Admin (admin@findnest.com)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
