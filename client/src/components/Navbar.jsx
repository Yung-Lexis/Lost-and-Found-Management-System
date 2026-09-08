import React from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles,
  HelpCircle,
  LogIn,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar({ currentView, setCurrentView, onOpenReportModal }) {
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.info('Signed out successfully.');
    if (currentView === 'login') {
      setCurrentView('dashboard');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="nav-brand" onClick={() => setCurrentView('dashboard')}>
          <div className="brand-icon-wrapper">
            <Compass size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span>Find<span style={{ color: 'var(--primary)' }}>Nest</span></span>
            <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
              LOST & FOUND SYSTEM
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          
          <button
            className={`nav-btn ${currentView === 'items' ? 'active' : ''}`}
            onClick={() => setCurrentView('items')}
          >
            <Search size={18} />
            <span>Browse Items</span>
          </button>

          <button
            className={`nav-btn ${currentView === 'report' ? 'active' : ''}`}
            onClick={() => setCurrentView('report')}
          >
            <PlusCircle size={18} />
            <span>Report Item</span>
          </button>
        </nav>

        {/* Action Controls & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          {/* User Auth Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.3rem 0.65rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-color)'
                }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem'
                  }}>
                    <User size={12} />
                  </div>
                  <span>{user?.name?.split(' ')[0] || 'Staff'}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--primary)',
                    padding: '0.1rem 0.35rem',
                    borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}>
                    {user?.role || 'staff'}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleLogout}
                  title="Sign Out"
                  style={{ padding: '0.35rem 0.6rem', color: 'var(--text-muted)' }}
                >
                  <LogOut size={15} />
                  <span style={{ fontSize: '0.8rem' }}>Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={`btn btn-sm ${currentView === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentView('login')}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
              >
                <LogIn size={15} />
                <span>Staff Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
