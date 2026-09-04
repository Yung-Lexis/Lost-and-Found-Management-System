import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ItemsDirectory from './pages/ItemsDirectory';
import ReportModal from './components/ReportModal';
import ItemDetailModal from './components/ItemDetailModal';
import EditItemModal from './components/EditItemModal';
import ClaimItemModal from './components/ClaimItemModal';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [filterParams, setFilterParams] = useState({});
  const [reportModalType, setReportModalType] = useState(null); // 'lost' | 'found' | null
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [claimingItem, setClaimingItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const handleNavigateToItems = (filters = {}) => {
    setFilterParams(filters);
    setCurrentView('items');
  };

  const handleOpenReportModal = (type = 'lost') => {
    setReportModalType(type);
  };

  const handleCloseReportModal = () => {
    setReportModalType(null);
  };

  const handleReportSuccess = (createdItem) => {
    triggerRefresh();
    if (createdItem?._id) {
      setSelectedItemId(createdItem._id);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
  };

  const handleEditSuccess = (updatedItem) => {
    triggerRefresh();
    // Update active item preview if opened
    if (selectedItemId === updatedItem._id) {
      setSelectedItemId(null);
      setTimeout(() => setSelectedItemId(updatedItem._id), 50);
    }
  };

  const handleOpenClaim = (item) => {
    setClaimingItem(item);
  };

  const handleClaimSuccess = (claimedItem) => {
    triggerRefresh();
    if (selectedItemId === claimedItem._id) {
      setSelectedItemId(null);
      setTimeout(() => setSelectedItemId(claimedItem._id), 50);
    }
  };

  const handleItemDeleted = (deletedId) => {
    triggerRefresh();
    setSelectedItemId(null);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenReportModal={handleOpenReportModal}
      />

      {/* Main Viewport */}
      <main className="main-content">
        {currentView === 'dashboard' && (
          <Dashboard
            key={`dashboard-${refreshKey}`}
            onNavigateToItems={handleNavigateToItems}
            onOpenReportModal={handleOpenReportModal}
            onSelectItem={(id) => setSelectedItemId(id)}
          />
        )}

        {currentView === 'items' && (
          <ItemsDirectory
            key={`items-${refreshKey}-${JSON.stringify(filterParams)}`}
            initialFilters={filterParams}
            onSelectItem={(id) => setSelectedItemId(id)}
            onOpenReportModal={handleOpenReportModal}
          />
        )}
      </main>

      {/* Report Modal */}
      {reportModalType && (
        <ReportModal
          initialType={reportModalType}
          onClose={handleCloseReportModal}
          onSuccess={handleReportSuccess}
        />
      )}

      {/* Item Detail Modal */}
      {selectedItemId && (
        <ItemDetailModal
          itemId={selectedItemId}
          onClose={() => setSelectedItemId(null)}
          onOpenEdit={handleOpenEdit}
          onOpenClaim={handleOpenClaim}
          onItemDeleted={handleItemDeleted}
          onSelectMatchItem={(matchId) => setSelectedItemId(matchId)}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Claim / Return Modal */}
      {claimingItem && (
        <ClaimItemModal
          item={claimingItem}
          onClose={() => setClaimingItem(null)}
          onSuccess={handleClaimSuccess}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>FindNest — Modern Lost & Found Management System © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
