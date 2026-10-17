import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffModal from './StaffModal.js';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { staffAPI } from '../services/api';
import { FiEdit, FiX, FiUsers } from 'react-icons/fi';

const Team = ({ onLogout }) => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const fetchStaff = async () => {
    try {
      setStaffLoading(true);
      setStaffError('');
      const staffData = await staffAPI.getStaff();

      let staffList = [];
      if (Array.isArray(staffData)) {
        staffList = staffData;
      } else if (staffData && Array.isArray(staffData.data)) {
        staffList = staffData.data;
      } else if (staffData && Array.isArray(staffData.staffList)) {
        staffList = staffData.staffList;
      } else if (staffData && typeof staffData === 'object') {
        staffList = Object.values(staffData).find(Array.isArray) || [];
      }

      setStaff(staffList);
    } catch (err) {
      // console.error('Error fetching staff:', err);
      setStaffError(err.response.data.Message || 'Failed to fetch staff');
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const saveStaff = async (staffData) => {
    try {
      const savedStaff = await staffAPI.saveStaff(staffData);
      await fetchStaff();
      return savedStaff;
    } catch (err) {
      // console.error('Error saving staff:', err);
      throw err;
    }
  };

  const deleteStaff = async (staffId) => {
    try {
      const deletedStaff = await staffAPI.deleteStaff(staffId);
      await fetchStaff();
      return deletedStaff;
    } catch (err) {
      // console.error('Error deleting staff:', err);
      throw err;
    }
  };

  const openStaffModal = () => {
    setEditingStaff(null);
    setIsStaffModalOpen(true);
  };

  const openEditStaffModal = async (staffMember) => {
    try {
      const staffId = staffMember._id || staffMember.staffId;
      if (staffId) {
        const fullStaffData = await staffAPI.getStaffById(staffId);
        setEditingStaff(fullStaffData);
      } else {
        setEditingStaff(staffMember);
      }
    } catch (err) {
      console.error('Error fetching staff details:', err);
      setEditingStaff(staffMember);
    }
    setIsStaffModalOpen(true);
  };

  const closeStaffModal = () => {
    setIsStaffModalOpen(false);
    setEditingStaff(null);
  };

  return (
    <div className="mm-app-shell">
      <Sidebar onLogout={handleLogout} activePage="team" />

      <main className="mm-main">
        {/* Sticky Modern Topbar */}
        <header className="mm-topbar">
          <div className="mm-topbar-left">
            <div className="mm-breadcrumbs">
              <span className="mm-bc-root">Naari Art</span>
              <span className="mm-bc-sep">/</span>
              <span className="mm-bc-cur">Team & Staff</span>
            </div>
          </div>
          <div className="mm-topbar-right">
            <div className="mm-studio-badge">
              <span className="mm-studio-dot" />
              <span>Naari Couture Studio</span>
            </div>
            <button className="mm-btn-primary" onClick={openStaffModal}>
              + Add Staff
            </button>
          </div>
        </header>

        <div className="mm-content">
          {staffError && (
            <div className="error-banner" style={{ marginBottom: '20px' }}>
              {staffError}
            </div>
          )}

          <div className="mm-table-card">
            <div className="mm-module-header">
              <div className="mm-header-left">
                <div className="mm-header-icon-badge">
                  <FiUsers size={20} />
                </div>
                <div className="mm-header-title-group">
                  <div className="mm-header-title-row">
                    <h2>Staff & Artisan Accounts</h2>
                    <span className="mm-count-pill">{staff.length} Members</span>
                  </div>
                  <p className="mm-header-subtitle">
                    Manage studio artisans, master tailors, cutters and subadmin access
                  </p>
                </div>
              </div>
              <div className="mm-header-right">
                <button className="mm-btn-primary" onClick={openStaffModal}>
                  + Add Staff
                </button>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {staffLoading ? (
                <div className="mm-table-state">
                  <div className="state-desc">Loading staff accounts...</div>
                </div>
              ) : Array.isArray(staff) && staff.length > 0 ? (
                <div className="roll-list">
                  {staff
                    .filter((staffMember) => staffMember.roleid?.name !== "Admin Role")
                    .map((staffMember, index) => (
                      <div key={staffMember._id || index} className="roll-item" style={{ borderRadius: '12px', border: '1px solid #E2E8F0', padding: '14px 18px', background: '#FAFAFA', marginBottom: '10px' }}>
                        <div className="roll-info">
                          <div className="roll-name" style={{ fontWeight: '700', fontSize: '15px', color: '#0F172A' }}>
                            {staffMember.name || staffMember.fullName || 'Unknown'}
                          </div>
                          <span className="mm-outfit-tag" style={{ marginLeft: '10px' }}>
                            {staffMember.roleid?.name || 'Staff'}
                          </span>
                        </div>
                        <div className="roll-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            className="mm-table-action-btn"
                            onClick={() => openEditStaffModal(staffMember)}
                            title="Edit Staff"
                          >
                            <FiEdit size={14} />
                          </button>
                          <button
                            className="mm-table-action-btn"
                            style={{ color: '#DC2626' }}
                            onClick={() => deleteStaff(staffMember._id)}
                            title="Delete Staff"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="mm-table-state">
                  <div className="state-title">No staff accounts found</div>
                  <div className="state-desc">Add team members and assign atelier roles.</div>
                  <button className="mm-btn-primary" onClick={openStaffModal}>
                    + Add Your First Staff Member
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={closeStaffModal}
        onSave={saveStaff}
        editingStaff={editingStaff}
      />
    </div>
  );
};

export default Team;
