import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  getCollaborators,
  updateCollaboratorStatus,
  deleteCollaboratorInquiry,
} from '../services/collaboratorService';
import { sendCollaboratorWhatsApp } from '../utils/whatsapp';
import { triggerInAppNotification } from '../contexts/NotificationContext';
import { storage } from '../utils/storage';
import {
  FiUsers,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiInstagram,
  FiPhone,
  FiMapPin,
  FiFilter,
  FiTrash2,
  FiEdit3,
  FiExternalLink,
  FiHelpCircle,
  FiMessageSquare,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import '../styles.css';

const REASON_PRESETS = [
  'Commercial budget quote exceeds seasonal PR budget',
  'Low audience engagement rate / mostly inactive followers',
  'Out of couture niche (demographic mismatch)',
  'Location & logistics delivery constraints',
  'No response to partnership proposal',
  'Postponed to next festive bridal season',
  'Other / Custom reason',
];

const Collaborators = ({ onLogout }) => {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, Yes, No, Pending
  const [editingItem, setEditingItem] = useState(null);
  const [modalReason, setModalReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [modalStatus, setModalStatus] = useState('No');
  const [modalNotes, setModalNotes] = useState('');

  const loadData = () => {
    setLoading(true);
    const data = getCollaborators();
    setCollaborators(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = (e) => {
      if (e.detail) setCollaborators(e.detail);
    };
    window.addEventListener('naari-collaborators-changed', handleUpdate);
    return () => window.removeEventListener('naari-collaborators-changed', handleUpdate);
  }, []);

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = collaborators.length;
    const converted = collaborators.filter((c) => c.converted === 'Yes').length;
    const notConverted = collaborators.filter((c) => c.converted === 'No').length;
    const pending = collaborators.filter((c) => c.converted === 'Pending' || !c.converted).length;
    return { total, converted, notConverted, pending };
  }, [collaborators]);

  // Filtered List
  const filteredList = useMemo(() => {
    let list = [...collaborators];
    const q = search.trim().toLowerCase();
    const cleanDigits = q.replace(/\D/g, '');

    if (statusFilter !== 'ALL') {
      list = list.filter((item) => (item.converted || 'Pending') === statusFilter);
    }

    if (q) {
      list = list.filter((item) => {
        const phoneDigits = String(item.phone || '').replace(/\D/g, '');
        const phoneMatch = cleanDigits && phoneDigits.includes(cleanDigits);
        const textMatch = [
          item.fullName,
          item.instagramHandle,
          item.platform,
          item.city,
          item.collabType,
          item.reason,
          item.statusNotes,
        ].some((val) => String(val || '').toLowerCase().includes(q));
        return phoneMatch || textMatch;
      });
    }

    return list;
  }, [collaborators, search, statusFilter]);

  const openStatusModal = (item) => {
    setEditingItem(item);
    setModalStatus(item.converted || 'Pending');
    const existingReason = item.reason || '';
    if (REASON_PRESETS.includes(existingReason)) {
      setModalReason(existingReason);
      setCustomReason('');
    } else if (existingReason) {
      setModalReason('Other / Custom reason');
      setCustomReason(existingReason);
    } else {
      setModalReason(REASON_PRESETS[0]);
      setCustomReason('');
    }
    setModalNotes(item.statusNotes || '');
  };

  const handleSaveStatus = async () => {
    if (!editingItem) return;
    const finalReason =
      modalStatus === 'No'
        ? modalReason === 'Other / Custom reason'
          ? customReason.trim()
          : modalReason
        : '';

    await updateCollaboratorStatus(editingItem.id, {
      converted: modalStatus,
      reason: finalReason,
      statusNotes: modalNotes.trim(),
    });

    triggerInAppNotification(
      'Collaborator Status Updated',
      `${editingItem.fullName} marked as ${modalStatus === 'Yes' ? 'Converted' : modalStatus === 'No' ? 'Not Converted' : 'Pending'}.`,
      modalStatus === 'Yes' ? 'success' : 'info'
    );

    setEditingItem(null);
    loadData();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete inquiry for "${name}"?`)) {
      await deleteCollaboratorInquiry(id);
      triggerInAppNotification('Inquiry Removed', `Collaborator inquiry removed.`, 'info');
      loadData();
    }
  };

  return (
    <div className="settings-container mm-app-shell">
      <Sidebar onLogout={handleLogout} activePage="collaborators" />
      <main className="main-content mm-main">
        {/* Topbar */}
        <header className="mm-topbar">
          <div className="mm-topbar-left">
            <div className="mm-breadcrumbs">
              <span className="mm-bc-root">Naari Art</span>
              <span className="mm-bc-sep">/</span>
              <span className="mm-bc-cur">Collaborators & Influencers</span>
            </div>
          </div>
          <div className="mm-topbar-right">
            <div className="mm-studio-badge">
              <span className="mm-studio-dot" />
              <span>Couture Partnerships</span>
            </div>
          </div>
        </header>

        <div className="mm-content">
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
                Influencer & Creator Collaborations
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
                Track creator inquiries from the website, monitor partnership conversion, and document why specific collaborations did not convert.
              </p>
            </div>
            <a
              href="#/collaborate"
              target="_blank"
              rel="noreferrer"
              className="mm-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', textDecoration: 'none' }}
            >
              <FiExternalLink size={14} /> View Public Application Form
            </a>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            <div className="mm-stat-card" style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                Total Inquiries
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#1F2937' }}>{stats.total}</div>
            </div>

            <div
              className="mm-stat-card"
              onClick={() => setStatusFilter('Yes')}
              style={{
                background: '#ECFDF5',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid #A7F3D0',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#065F46', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiCheckCircle size={14} /> Converted (Yes)
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#065F46' }}>{stats.converted}</div>
            </div>

            <div
              className="mm-stat-card"
              onClick={() => setStatusFilter('No')}
              style={{
                background: '#FEF2F2',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid #FECACA',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#991B1B', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiXCircle size={14} /> Not Converted (No)
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#991B1B' }}>{stats.notConverted}</div>
            </div>

            <div
              className="mm-stat-card"
              onClick={() => setStatusFilter('Pending')}
              style={{
                background: '#FFFBEB',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid #FDE68A',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400E', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiClock size={14} /> Pending Review
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#92400E' }}>{stats.pending}</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="mm-table-card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
                <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search creator name, @handle, phone, city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['ALL', 'Yes', 'No', 'Pending'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatusFilter(f)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      background: statusFilter === f ? 'var(--primary-color)' : '#F3F4F6',
                      color: statusFilter === f ? '#FFFFFF' : '#374151',
                    }}
                  >
                    {f === 'ALL' ? 'All Inquiries' : f === 'Yes' ? 'Converted' : f === 'No' ? 'Not Converted' : 'Pending'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="customers-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--primary-orange-color)', borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ padding: '12px 14px', color: '#374151' }}>Creator / Influencer</th>
                    <th style={{ padding: '12px 14px', color: '#374151' }}>Platform & Reach</th>
                    <th style={{ padding: '12px 14px', color: '#374151' }}>Contact & City</th>
                    <th style={{ padding: '12px 14px', color: '#374151' }}>Collab Type</th>
                    <th style={{ padding: '12px 14px', color: '#374151' }}>Converted?</th>
                    <th style={{ padding: '12px 14px', color: '#374151' }}>Reason (Shu kam nathi thaya)</th>
                    <th style={{ padding: '12px 14px', color: '#374151', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length > 0 ? (
                    filteredList.map((item) => {
                      const isConverted = item.converted === 'Yes';
                      const isRejected = item.converted === 'No';
                      const isPending = !item.converted || item.converted === 'Pending';

                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: '700', color: '#111827' }}>{item.fullName}</div>
                            {item.instagramHandle && (
                              <a
                                href={`https://instagram.com/${item.instagramHandle.replace('@', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontSize: '12px',
                                  color: 'var(--primary-color)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  textDecoration: 'none',
                                  marginTop: '2px',
                                }}
                              >
                                <FiInstagram size={12} /> @{item.instagramHandle.replace('@', '')}
                              </a>
                            )}
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: '600', color: '#1F2937' }}>{item.followers || '-'}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>{item.platform}</div>
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1F2937' }}>
                              <FiPhone size={12} color="#6B7280" /> {item.phone || '-'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <FiMapPin size={11} /> {item.city}
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '500' }}>
                              {item.collabType}
                            </span>
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            {isConverted && (
                              <span style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <FiCheckCircle size={12} /> Yes (Converted)
                              </span>
                            )}
                            {isRejected && (
                              <span style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <FiXCircle size={12} /> No (Not Converted)
                              </span>
                            )}
                            {isPending && (
                              <span style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <FiClock size={12} /> Pending Review
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '12px 14px', maxWidth: '240px' }}>
                            {isRejected ? (
                              <div style={{ color: '#991B1B', fontSize: '12px', lineHeight: '1.4' }}>
                                <strong>Reason:</strong> {item.reason || 'No specific reason entered.'}
                              </div>
                            ) : isConverted ? (
                              <div style={{ color: '#065F46', fontSize: '12px' }}>
                                {item.statusNotes || 'Successfully converted into active partnership.'}
                              </div>
                            ) : (
                              <span style={{ color: '#9CA3AF', fontSize: '12px' }}>Under review</span>
                            )}
                          </td>

                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="mm-table-action-btn mm-whatsapp-btn"
                                title="Chat on WhatsApp"
                                onClick={() => sendCollaboratorWhatsApp(item)}
                                style={{ color: '#25D366' }}
                              >
                                <FaWhatsapp size={15} />
                              </button>
                              <button
                                type="button"
                                className="mm-table-action-btn"
                                title="Update Conversion Status & Reason"
                                onClick={() => openStatusModal(item)}
                              >
                                <FiEdit3 size={14} />
                              </button>
                              <button
                                type="button"
                                className="mm-table-action-btn"
                                title="Delete Inquiry"
                                onClick={() => handleDelete(item.id, item.fullName)}
                                style={{ color: '#EF4444' }}
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#6B7280' }}>
                        No collaborator inquiries found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Status & Reason Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '14px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', margin: 0, color: '#111827' }}>
                Update Collaborator: {editingItem.fullName}
              </h2>
              <button type="button" onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9CA3AF' }}>
                ×
              </button>
            </div>

            <div className="modal-body" style={{ padding: '18px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#374151' }}>
                  Has this collaborator converted? *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setModalStatus('Yes')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: modalStatus === 'Yes' ? '2px solid #10B981' : '1px solid #D1D5DB',
                      background: modalStatus === 'Yes' ? '#ECFDF5' : '#fff',
                      color: modalStatus === 'Yes' ? '#065F46' : '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Yes (Converted)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalStatus('No')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: modalStatus === 'No' ? '2px solid #EF4444' : '1px solid #D1D5DB',
                      background: modalStatus === 'No' ? '#FEF2F2' : '#fff',
                      color: modalStatus === 'No' ? '#991B1B' : '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    ✕ No (Not Converted)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalStatus('Pending')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: modalStatus === 'Pending' ? '2px solid #F59E0B' : '1px solid #D1D5DB',
                      background: modalStatus === 'Pending' ? '#FFFBEB' : '#fff',
                      color: modalStatus === 'Pending' ? '#92400E' : '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    ⏳ Pending
                  </button>
                </div>
              </div>

              {/* If "No", Ask "Shu kam nathi thaya" Reason */}
              {modalStatus === 'No' && (
                <div style={{ background: '#FEF2F2', padding: '14px', borderRadius: '10px', border: '1px solid #FECACA' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#991B1B', marginBottom: '8px' }}>
                    Reason (Shu kam nathi thaya?):
                  </label>
                  <select
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #FCA5A5', fontSize: '13px', marginBottom: '10px' }}
                  >
                    {REASON_PRESETS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  {modalReason === 'Other / Custom reason' && (
                    <input
                      type="text"
                      placeholder="Enter custom reason why collaboration did not convert..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #FCA5A5', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  )}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                  Internal Status Notes
                </label>
                <textarea
                  rows="2"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="e.g. Outfit selected, fitting date scheduled, or counter-offer details..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E5E7EB', paddingTop: '14px' }}>
              <button
                type="button"
                className="mm-btn-secondary"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="mm-btn-primary"
                onClick={handleSaveStatus}
              >
                Save Conversion Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collaborators;
