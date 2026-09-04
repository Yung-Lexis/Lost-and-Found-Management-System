import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Filter,
  Grid,
  List,
  Calendar,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Phone
} from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_CATEGORIES = [
  'All',
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

export default function ItemsDirectory({
  initialFilters = {},
  onSelectItem,
  onOpenReportModal
}) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState(initialFilters.search || '');
  const [status, setStatus] = useState(initialFilters.status || 'all');
  const [category, setCategory] = useState(initialFilters.category || 'All');
  const [sort, setSort] = useState('-createdAt');
  const [startDate, setStartDate] = useState(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters.endDate || '');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // View state: 'grid' | 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Load Categories once
  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCategories(['All', ...res.data]);
        }
      })
      .catch((err) => console.warn('Categories error fallback:', err.message));
  }, []);

  // Fetch Items whenever filters or pagination change
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 12,
        sort,
        ...(search.trim() ? { q: search.trim() } : {}),
        ...(status !== 'all' ? { status } : {}),
        ...(category !== 'All' ? { category } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {})
      };

      const res = await api.getItems(params);
      if (res.success) {
        setItems(res.data);
        setPagination({
          totalPages: res.pagination?.totalPages || 1,
          total: res.total || 0
        });
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, status, category, sort, startDate, endDate, page]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setCategory('All');
    setStartDate('');
    setEndDate('');
    setSort('-createdAt');
    setPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (itemStatus) => {
    switch (itemStatus) {
      case 'lost':
        return <span className="badge badge-lost"><AlertCircle size={12} /> Lost</span>;
      case 'found':
        return <span className="badge badge-found"><CheckCircle2 size={12} /> Found</span>;
      case 'claimed':
        return <span className="badge badge-claimed"><Sparkles size={12} /> Returned</span>;
      default:
        return <span className="badge">{itemStatus}</span>;
    }
  };

  const hasActiveFilters = search || status !== 'all' || category !== 'All' || startDate || endDate;

  return (
    <div className="items-directory-page">
      {/* Page Header */}
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Items Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Search, filter, and explore all lost and found reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-lost btn-sm" onClick={() => onOpenReportModal('lost')}>
            <HelpCircle size={16} />
            <span>Report Lost</span>
          </button>
          <button className="btn btn-found btn-sm" onClick={() => onOpenReportModal('found')}>
            <PlusCircle size={16} />
            <span>Report Found</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="directory-toolbar">
        {/* Top: Search bar & Status Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div className="search-input-wrapper">
            <Search className="search-input-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by keywords (e.g., wallet, AirPods, keys, blue backpack, cafeteria)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                className="search-input-clear"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="status-tabs">
            <button
              className={`status-tab-btn ${status === 'all' ? 'active' : ''}`}
              onClick={() => { setStatus('all'); setPage(1); }}
            >
              <span>All Reports</span>
            </button>

            <button
              className={`status-tab-btn ${status === 'lost' ? 'active' : ''}`}
              onClick={() => { setStatus('lost'); setPage(1); }}
            >
              <AlertCircle size={14} style={{ color: status === 'lost' ? 'inherit' : 'var(--danger)' }} />
              <span>Lost Only</span>
            </button>

            <button
              className={`status-tab-btn ${status === 'found' ? 'active' : ''}`}
              onClick={() => { setStatus('found'); setPage(1); }}
            >
              <CheckCircle2 size={14} style={{ color: status === 'found' ? 'inherit' : 'var(--success)' }} />
              <span>Found Only</span>
            </button>

            <button
              className={`status-tab-btn ${status === 'claimed' ? 'active' : ''}`}
              onClick={() => { setStatus('claimed'); setPage(1); }}
            >
              <Sparkles size={14} style={{ color: status === 'claimed' ? 'inherit' : '#7c3aed' }} />
              <span>Returned</span>
            </button>
          </div>
        </div>

        {/* Bottom Filter Controls */}
        <div className="filter-row">
          <div className="filter-controls">
            {/* Category */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Package size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="filter-select"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              className="filter-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-date">Date Lost/Found (Recent)</option>
              <option value="date">Date Lost/Found (Oldest)</option>
              <option value="title_asc">Name (A-Z)</option>
            </select>

            {/* Date Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="date"
                className="filter-select"
                style={{ padding: '0.45rem 0.65rem' }}
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                title="Filter start date"
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>
              <input
                type="date"
                className="filter-select"
                style={{ padding: '0.45rem 0.65rem' }}
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                title="Filter end date"
              />
            </div>
          </div>

          {/* View toggle */}
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={17} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Filters:</span>
          {search && (
            <span className="filter-chip">
              Search: "{search}"
              <button className="chip-remove" onClick={() => setSearch('')}><X size={13} /></button>
            </span>
          )}
          {status !== 'all' && (
            <span className="filter-chip">
              Status: {status}
              <button className="chip-remove" onClick={() => setStatus('all')}><X size={13} /></button>
            </span>
          )}
          {category !== 'All' && (
            <span className="filter-chip">
              Category: {category}
              <button className="chip-remove" onClick={() => setCategory('All')}><X size={13} /></button>
            </span>
          )}
          {(startDate || endDate) && (
            <span className="filter-chip">
              Date: {startDate || 'Any'} to {endDate || 'Now'}
              <button className="chip-remove" onClick={() => { setStartDate(''); setEndDate(''); }}><X size={13} /></button>
            </span>
          )}
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            onClick={handleResetFilters}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        viewMode === 'grid' ? (
          <div className="activity-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : (
          <div className="table-container" style={{ padding: '1.5rem' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: 45, marginBottom: '0.75rem' }} />
            ))}
          </div>
        )
      )}

      {error && !loading && (
        <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger-border)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', color: 'var(--danger-text)', marginBottom: '2rem' }}>
          <strong>Error loading items:</strong> {error}
          <button className="btn btn-sm btn-secondary" style={{ marginLeft: '1rem' }} onClick={fetchItems}>
            Retry
          </button>
        </div>
      )}

      {/* Main Results View */}
      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No matching reports found
              </h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 1.5rem', fontSize: '0.925rem' }}>
                {hasActiveFilters 
                  ? 'Try broadening your search query or clearing some of the active filters.' 
                  : 'No items are currently in the directory. You can be the first to report an item!'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                {hasActiveFilters && (
                  <button className="btn btn-secondary" onClick={handleResetFilters}>
                    Clear Filters
                  </button>
                )}
                <button className="btn btn-primary" onClick={() => onOpenReportModal('lost')}>
                  <HelpCircle size={16} />
                  <span>Report Missing Item</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="activity-grid">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="item-card"
                  onClick={() => onSelectItem(item._id)}
                >
                  <div>
                    {item.image && (
                      <div style={{ height: 160, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', background: '#000' }}>
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}

                    <div className="item-card-header">
                      <span className="item-card-title">{item.title}</span>
                      {getStatusBadge(item.status)}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.9rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </p>

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
                    <span>View Full Details & Matches</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="table-container">
              <table className="directory-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Item Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Reporter</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} onClick={() => onSelectItem(item._id)}>
                      <td>{getStatusBadge(item.status)}</td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{item.title}</strong>
                      </td>
                      <td>
                        <span className="badge badge-category">{item.category}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{item.location}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatDate(item.date)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.reporterName}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectItem(item._id);
                          }}
                        >
                          <span>View</span>
                          <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pagination-wrapper">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Showing page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total items)
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
