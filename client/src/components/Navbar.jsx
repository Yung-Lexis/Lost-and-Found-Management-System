import React from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, onOpenReportModal }) {
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
        </nav>

        {/* Quick Report Actions */}
        <div className="nav-actions">
          <button
            className="btn btn-lost btn-sm"
            onClick={() => onOpenReportModal('lost')}
          >
            <HelpCircle size={16} />
            <span>Report Lost</span>
          </button>

          <button
            className="btn btn-found btn-sm"
            onClick={() => onOpenReportModal('found')}
          >
            <PlusCircle size={16} />
            <span>Report Found</span>
          </button>
        </div>
      </div>
    </header>
  );
}
