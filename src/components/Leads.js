import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertCircle,
  FiEdit2,
  FiEye,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiPhone,
  FiMapPin,
  FiGrid,
  FiList,
  FiCalendar,
  FiUserCheck,
} from 'react-icons/fi';
import Sidebar from './Sidebar';
import Pagination from './Pagination';
import { inquiryAPI } from '../services/api';
import { storage } from '../utils/storage';
import { triggerInAppNotification } from '../contexts/NotificationContext';
import '../styles.css';
import './Leads.css';

const EMPTY_FORM = {
  leadName: '',
  company: '',
  phone: '',
  email: '',
  state: '',
  city: '',
  source: 'Manual',
  pipelineStage: 'New',
  owner: '',
  lastFollowUp: '',
  nextFollowUp: '',
  leadResponseMessage: '',
};

const STAGES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

const STAGE_COLORS = {
  New: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
  Contacted: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  Qualified: { bg: '#FDF4FF', text: '#86198F', border: '#F5D0FE' },
  Converted: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  Lost: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
};

const dateInputValue = (value) => (value ? String(value).slice(0, 10) : '');

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
};

const Leads = ({ onLogout }) => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('naari_leads_view') || 'kanban'); // 'table' | 'kanban'
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [dialogMode, setDialogMode] = useState('view');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const itemsPerPage = 12;

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('naari_leads_view', mode);
  };

  const loadLeads = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await inquiryAPI.getInquiries();
      setLeads(data);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load inquiries.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Filter with universal phone search (removes spaces, dashes, symbols)
  const filteredLeads = useMemo(() => {
    let list = [...leads];
    const query = search.trim().toLowerCase();
    const cleanDigits = query.replace(/\D/g, '');

    if (query) {
      list = list.filter((lead) => {
        const leadPhoneDigits = String(lead.phone || '').replace(/\D/g, '');
        const phoneMatch = cleanDigits && leadPhoneDigits.includes(cleanDigits);

        const textMatch = [
          lead.leadName,
          lead.company,
          lead.phone,
          lead.email,
          lead.city,
          lead.state,
          lead.pipelineStage,
          lead.source,
        ].some((value) => String(value || '').toLowerCase().includes(query));

        return phoneMatch || textMatch;
      });
    }

    // Sorting
    list.sort((a, b) => {
      let valA, valB;
      if (sortField === 'name') {
        valA = (a.leadName || '').toLowerCase();
        valB = (b.leadName || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (sortField === 'stage') {
        valA = (a.pipelineStage || '').toLowerCase();
        valB = (b.pipelineStage || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        // date
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });

    return list;
  }, [leads, search, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const visibleLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const openLead = (lead, mode) => {
    setSelectedLead(lead);
    setDialogMode(mode);
    setError('');
    setForm({
      ...EMPTY_FORM,
      ...lead,
      lastFollowUp: dateInputValue(lead.lastFollowUp),
      nextFollowUp: dateInputValue(lead.nextFollowUp),
    });
  };

  const openAddLead = () => {
    setSelectedLead({ isNew: true });
    setDialogMode('create');
    setError('');
    setForm(EMPTY_FORM);
  };

  const closeDialog = () => {
    if (saving) return;
    setSelectedLead(null);
    setError('');
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  // Quick move pipeline stage directly from Kanban
  const handleStageChange = async (lead, newStage) => {
    try {
      const updatedLead = { ...lead, pipelineStage: newStage };
      await inquiryAPI.updateInquiry(updatedLead);
      setLeads((current) =>
        current.map((l) => (Number(l.id) === Number(lead.id) ? { ...l, pipelineStage: newStage } : l))
      );
      triggerInAppNotification(
        'Lead Stage Updated',
        `Moved ${lead.leadName || 'Lead'} to "${newStage}" stage.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      triggerInAppNotification('Update Failed', err.message || 'Could not change lead stage.', 'error');
    }
  };

  // Drag and Drop handlers for Kanban
  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.setData('text/plain', String(lead.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleDragOverColumn = (e, stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeaveColumn = (e, stage) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverStage === stage) {
      setDragOverStage(null);
    }
  };

  const handleDropOnColumn = async (e, targetStage) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedLead) return;

    if ((draggedLead.pipelineStage || 'New').toLowerCase() === targetStage.toLowerCase()) {
      setDraggedLead(null);
      return;
    }

    const leadToUpdate = draggedLead;
    setDraggedLead(null);
    await handleStageChange(leadToUpdate, targetStage);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedLead) return;

    setSaving(true);
    setError('');

    if (dialogMode === 'create') {
      const newLeadData = {
        ...form,
        source: form.source || 'Manual',
        lastFollowUp: form.lastFollowUp || null,
        nextFollowUp: form.nextFollowUp || null,
      };

      try {
        const response = await inquiryAPI.addInquiry(newLeadData);
        const createdLead = response.inquiry || {
          id: Date.now(),
          ...newLeadData,
          createdAt: new Date().toISOString(),
        };
        setLeads((current) => [createdLead, ...current]);
        setNotice('New lead added successfully.');
        triggerInAppNotification('New Lead Created', `Lead for ${form.leadName} has been created.`, 'success');
        setSelectedLead(null);
      } catch (saveError) {
        setError(saveError.message || 'Unable to add this lead.');
      } finally {
        setSaving(false);
      }
      return;
    }

    const updatedLead = {
      id: selectedLead.id,
      ...form,
      lastFollowUp: form.lastFollowUp || null,
      nextFollowUp: form.nextFollowUp || null,
    };

    try {
      await inquiryAPI.updateInquiry(updatedLead);
      setLeads((current) =>
        current.map((lead) =>
          Number(lead.id) === Number(selectedLead.id) ? { ...lead, ...updatedLead } : lead
        )
      );
      setNotice('Lead updated successfully.');
      triggerInAppNotification('Lead Updated', `Lead for ${form.leadName} has been updated.`, 'success');
      setSelectedLead(null);
    } catch (saveError) {
      setError(saveError.message || 'Unable to update this lead.');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label, name, options = {}) => (
    <div className={`lead-field ${options.wide ? 'lead-field-wide' : ''}`}>
      <label htmlFor={`lead-${name}`}>
        {label}
        {options.required && ' *'}
      </label>
      {options.select ? (
        <select
          id={`lead-${name}`}
          name={name}
          value={form[name] || ''}
          onChange={handleFieldChange}
          disabled={dialogMode === 'view'}
          required={options.required}
        >
          {(options.options || STAGES).map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      ) : options.textarea ? (
        <textarea
          id={`lead-${name}`}
          name={name}
          value={form[name] || ''}
          onChange={handleFieldChange}
          disabled={dialogMode === 'view'}
          rows="4"
          required={options.required}
        />
      ) : (
        <input
          id={`lead-${name}`}
          name={name}
          type={options.type || 'text'}
          value={form[name] || ''}
          onChange={handleFieldChange}
          disabled={dialogMode === 'view'}
          required={options.required}
        />
      )}
    </div>
  );

  return (
    <div className="mm-app-shell">
      <Sidebar onLogout={handleLogout} activePage="leads" />

      <main className="mm-main">
        {/* Sticky Modern Topbar */}
        <header className="mm-topbar">
          <div className="mm-topbar-left">
            <div className="mm-breadcrumbs">
              <span className="mm-bc-root">Naari Art</span>
              <span className="mm-bc-sep">/</span>
              <span className="mm-bc-cur">Leads & Enquiries</span>
            </div>
          </div>
          <div className="mm-topbar-right">
            <div className="mm-studio-badge">
              <span className="mm-studio-dot" />
              <span>Naari Couture Studio</span>
            </div>
            {/* Unified + Add New Lead Button */}
            <button
              type="button"
              className="mm-btn-primary"
              onClick={openAddLead}
              id="btn-add-new-lead"
            >
              <FiPlus size={16} /> + Add New Lead
            </button>
          </div>
        </header>

        <div className="mm-content">
          {notice && (
            <div className="leads-notice" role="status" style={{ marginBottom: '16px' }}>
              {notice}
              <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">
                <FiX />
              </button>
            </div>
          )}

          {error && !selectedLead && (
            <div className="error-banner" role="alert" style={{ marginBottom: '16px' }}>
              <FiAlertCircle /> {error}
            </div>
          )}

          {/* Table / Kanban Card */}
          <div className="mm-table-card">
            {/* Module Header with View Toggle & Search */}
            <div className="mm-module-header">
              <div className="mm-header-left">
                <div className="mm-header-icon-badge">
                  <FiUserCheck size={20} />
                </div>
                <div className="mm-header-title-group">
                  <div className="mm-header-title-row">
                    <h2>Leads & Enquiries Pipeline</h2>
                    <span className="mm-count-pill">{filteredLeads.length} Leads</span>
                  </div>
                  <p className="mm-header-subtitle">
                    Track client consultations, bridal inquiries, custom orders and pipeline stages
                  </p>
                </div>
              </div>

              <div className="mm-header-right">
                {/* Prominent Add Button (Visible on both Mobile and Desktop) */}
                <button
                  type="button"
                  className="mm-btn-primary mm-header-action-btn"
                  onClick={openAddLead}
                  title="Add New Lead / Enquiry"
                >
                  <FiPlus size={15} /> + Add New Lead
                </button>

                {/* View Switcher: Kanban vs Table */}
                <div className="leads-view-toggle">
                  <button
                    type="button"
                    className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                    onClick={() => toggleViewMode('kanban')}
                    title="Kanban Board View"
                  >
                    <FiGrid size={15} /> <span>Kanban</span>
                  </button>
                  <button
                    type="button"
                    className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => toggleViewMode('table')}
                    title="Data Table View"
                  >
                    <FiList size={15} /> <span>Table</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="mm-btn-ghost"
                  onClick={() => loadLeads(true)}
                  disabled={refreshing}
                  title="Refresh leads"
                >
                  <FiRefreshCw className={refreshing ? 'leads-spinning' : ''} size={14} />
                  <span>Refresh</span>
                </button>

                {/* Universal Search Bar (Supports phone number) */}
                <div className="mm-search-bar">
                  <FiSearch className="search-icon" size={14} />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by name, phone number, city..."
                  />
                </div>
              </div>
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="mm-table-state">
                <div className="state-desc">Loading inquiries and leads...</div>
              </div>
            ) : error && leads.length === 0 ? (
              <div className="mm-table-state">
                <div className="state-title">Unable to load leads</div>
                <div className="state-desc">{error}</div>
                <button type="button" className="mm-btn-primary" onClick={() => loadLeads()}>
                  Retry
                </button>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="mm-table-state">
                <div className="state-title">{search ? 'No matching leads' : 'No inquiries yet'}</div>
                <div className="state-desc">
                  {search ? 'Try searching with a different name or phone number.' : 'New website inquiries will appear here.'}
                </div>
                <button type="button" className="mm-btn-primary" onClick={openAddLead}>
                  <FiPlus size={15} /> Add New Lead
                </button>
              </div>
            ) : viewMode === 'kanban' ? (
              /* ================= KANBAN BOARD VIEW (DRAG & DROP ENABLED) ================= */
              <div className="leads-kanban-board">
                {STAGES.map((stage) => {
                  const stageLeads = filteredLeads.filter(
                    (l) => (l.pipelineStage || 'New').toLowerCase() === stage.toLowerCase()
                  );
                  const styleCfg = STAGE_COLORS[stage] || STAGE_COLORS.New;
                  const isOver = dragOverStage === stage;

                  return (
                    <div
                      key={stage}
                      className={`kanban-column ${isOver ? 'drag-over' : ''}`}
                      onDragOver={(e) => handleDragOverColumn(e, stage)}
                      onDragLeave={(e) => handleDragLeaveColumn(e, stage)}
                      onDrop={(e) => handleDropOnColumn(e, stage)}
                    >
                      <div className="kanban-column-header">
                        <div className="kanban-col-title-wrap">
                          <span
                            className="kanban-stage-dot"
                            style={{ backgroundColor: styleCfg.text }}
                          />
                          <span className="kanban-col-title">{stage}</span>
                        </div>
                        <span
                          className="kanban-col-count"
                          style={{
                            backgroundColor: styleCfg.bg,
                            color: styleCfg.text,
                            borderColor: styleCfg.border,
                          }}
                        >
                          {stageLeads.length}
                        </span>
                      </div>

                      <div className="kanban-card-list">
                        {stageLeads.length === 0 ? (
                          <div className="kanban-empty-col">
                            {isOver ? 'Drop lead here' : `No leads in ${stage}`}
                          </div>
                        ) : (
                          stageLeads.map((lead, idx) => {
                            const name = lead.leadName || 'Unnamed Lead';
                            const initials = name.slice(0, 2).toUpperCase();
                            const isBeingDragged = draggedLead?.id === lead.id;

                            return (
                              <div
                                key={lead.id || idx}
                                className={`kanban-card ${isBeingDragged ? 'is-dragging' : ''}`}
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, lead)}
                                onDragEnd={handleDragEnd}
                                onClick={() => openLead(lead, 'view')}
                                title="Drag this card to move stage, or click to view"
                              >
                                <div className="kanban-card-top">
                                  <div className="kanban-card-avatar">{initials}</div>
                                  <div className="kanban-card-info">
                                    <h4 className="kanban-card-name">{name}</h4>
                                    {lead.company && (
                                      <span className="kanban-card-company">{lead.company}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="kanban-card-details">
                                  {lead.phone && (
                                    <div className="kanban-card-row">
                                      <FiPhone size={12} className="kanban-icon" />
                                      <a
                                        href={`tel:${lead.phone}`}
                                        className="kanban-link"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {lead.phone}
                                      </a>
                                    </div>
                                  )}

                                  {(lead.city || lead.state) && (
                                    <div className="kanban-card-row">
                                      <FiMapPin size={12} className="kanban-icon" />
                                      <span>{[lead.city, lead.state].filter(Boolean).join(', ')}</span>
                                    </div>
                                  )}

                                  {lead.createdAt && (
                                    <div className="kanban-card-row">
                                      <FiCalendar size={12} className="kanban-icon" />
                                      <span>{formatDate(lead.createdAt)}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Quick Stage Mover & Actions */}
                                <div
                                  className="kanban-card-footer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <select
                                    className="kanban-stage-select"
                                    value={lead.pipelineStage || 'New'}
                                    onChange={(e) => handleStageChange(lead, e.target.value)}
                                  >
                                    {STAGES.map((s) => (
                                      <option key={s} value={s}>
                                        Move to: {s}
                                      </option>
                                    ))}
                                  </select>

                                  <div className="kanban-card-actions">
                                    <button
                                      type="button"
                                      className="mm-table-action-btn"
                                      onClick={() => openLead(lead, 'edit')}
                                      title="Edit Lead"
                                    >
                                      <FiEdit2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ================= MODERN TABLE VIEW ================= */
              <>
                {/* Desktop & Tablet Table */}
                <div className="mm-table-wrapper desktop-table-only">
                  <table className="mm-data-table">
                    <thead>
                      <tr>
                        <th
                          onClick={() => {
                            setSortField('name');
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          Lead Contact {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Phone / Email</th>
                        <th>Location</th>
                        <th
                          onClick={() => {
                            setSortField('stage');
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          Pipeline Stage {sortField === 'stage' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th
                          onClick={() => {
                            setSortField('date');
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          Received Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleLeads.map((lead, index) => {
                        const name = lead.leadName || 'Unnamed Lead';
                        const initials = name.slice(0, 2).toUpperCase();
                        const stage = lead.pipelineStage || 'New';
                        const styleCfg = STAGE_COLORS[stage] || STAGE_COLORS.New;

                        return (
                          <tr key={lead.id || `${lead.phone}-${index}`}>
                            <td>
                              <div className="mm-customer-cell">
                                <div className="customer-avatar-sm">{initials}</div>
                                <div>
                                  <div className="customer-name-text">{name}</div>
                                  {lead.source && (
                                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                                      via {lead.source}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <a href={`tel:${lead.phone || ''}`} className="mm-order-link">
                                  {lead.phone || '-'}
                                </a>
                                {lead.email && (
                                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                    {lead.email}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>{[lead.city, lead.state].filter(Boolean).join(', ') || '-'}</td>
                            <td>
                              <span
                                className="status-pill"
                                style={{
                                  backgroundColor: styleCfg.bg,
                                  color: styleCfg.text,
                                  borderColor: styleCfg.border,
                                  borderWidth: '1px',
                                  borderStyle: 'solid',
                                }}
                              >
                                {stage}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '13px', color: '#64748B' }}>
                                {formatDate(lead.createdAt)}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  className="mm-table-action-btn"
                                  onClick={() => openLead(lead, 'view')}
                                  title="View Lead"
                                >
                                  <FiEye size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="mm-table-action-btn"
                                  onClick={() => openLead(lead, 'edit')}
                                  title="Edit Lead"
                                >
                                  <FiEdit2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: Adaptive Card Grid */}
                <div className="mobile-card-grid">
                  {visibleLeads.map((lead, index) => {
                    const name = lead.leadName || 'Unnamed Lead';
                    const initials = name.slice(0, 2).toUpperCase();
                    const stage = lead.pipelineStage || 'New';
                    const styleCfg = STAGE_COLORS[stage] || STAGE_COLORS.New;

                    return (
                      <div
                        key={lead.id || index}
                        className="mobile-record-card"
                        onClick={() => openLead(lead, 'view')}
                      >
                        <div className="mobile-card-header">
                          <div className="mobile-card-avatar">{initials}</div>
                          <div className="mobile-card-header-info">
                            <h4 className="mobile-card-title">{name}</h4>
                            <span className="mobile-card-sub">
                              via {lead.source || 'Direct'}
                            </span>
                          </div>
                          <span
                            className="status-pill"
                            style={{
                              backgroundColor: styleCfg.bg,
                              color: styleCfg.text,
                              borderColor: styleCfg.border,
                              borderWidth: '1px',
                              borderStyle: 'solid',
                            }}
                          >
                            {stage}
                          </span>
                        </div>

                        <div className="mobile-card-body">
                          <div className="mobile-card-prop">
                            <span className="mobile-prop-label">Phone:</span>
                            <a
                              href={`tel:${lead.phone}`}
                              className="mobile-prop-val text-brand"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {lead.phone || '-'}
                            </a>
                          </div>
                          <div className="mobile-card-prop">
                            <span className="mobile-prop-label">Location:</span>
                            <span className="mobile-prop-val">
                              {[lead.city, lead.state].filter(Boolean).join(', ') || '-'}
                            </span>
                          </div>
                          <div className="mobile-card-prop">
                            <span className="mobile-prop-label">Date:</span>
                            <span className="mobile-prop-val">{formatDate(lead.createdAt)}</span>
                          </div>
                        </div>

                        <div
                          className="mobile-card-footer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="mobile-card-action-btn"
                            onClick={() => openLead(lead, 'view')}
                          >
                            <FiEye size={13} /> View
                          </button>
                          <button
                            type="button"
                            className="mobile-card-action-btn primary"
                            onClick={() => openLead(lead, 'edit')}
                          >
                            <FiEdit2 size={13} /> Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #EEF2F6', display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal Dialog */}
      {selectedLead && (
        <div
          className="modal-overlay leads-modal-overlay"
          onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}
        >
          <section
            className="modal-content leads-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-dialog-title"
          >
            <header className="modal-header">
              <div>
                <h2 id="lead-dialog-title">
                  {dialogMode === 'create'
                    ? 'Add New Lead / Inquiry'
                    : dialogMode === 'edit'
                    ? 'Edit Lead Details'
                    : 'Lead Details'}
                </h2>
                <p>
                  {dialogMode === 'create'
                    ? 'Enter details for the new prospective client'
                    : selectedLead.createdAt
                    ? `Received ${formatDate(selectedLead.createdAt)}`
                    : 'Website inquiry'}
                </p>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={closeDialog}
                aria-label="Close dialog"
              >
                <FiX />
              </button>
            </header>
            <form onSubmit={handleSave}>
              <div className="leads-form-grid">
                {renderField('Full Name', 'leadName', { required: true })}
                {renderField('Mobile Number', 'phone', { required: true, type: 'tel' })}
                {renderField('Company / Family Name', 'company')}
                {renderField('Email Address', 'email', { type: 'email' })}
                {renderField('State', 'state')}
                {renderField('City', 'city')}
                {renderField('Lead Source', 'source', {
                  select: true,
                  options: [
                    'Manual',
                    'Website',
                    'Phone Call',
                    'Referral',
                    'Instagram',
                    'Facebook',
                    'Walk-in',
                    'Bridal Consultation',
                    'Other',
                  ],
                })}
                {renderField('Pipeline Stage', 'pipelineStage', { select: true })}
                {renderField('Assigned Stylist / Owner', 'owner')}
                {renderField('Last Follow-up Date', 'lastFollowUp', { type: 'date' })}
                {renderField('Next Follow-up Date', 'nextFollowUp', { type: 'date' })}
                {renderField('Inquiry Message / Requirement', 'leadResponseMessage', {
                  textarea: true,
                  wide: true,
                })}
              </div>
              {error && (
                <p className="lead-form-error" role="alert">
                  {error}
                </p>
              )}
              <footer className="modal-footer leads-modal-footer">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={closeDialog}
                  disabled={saving}
                >
                  Close
                </button>
                {dialogMode === 'view' ? (
                  <button
                    type="button"
                    className="btn btn-save"
                    onClick={() => setDialogMode('edit')}
                  >
                    Edit Lead
                  </button>
                ) : (
                  <button type="submit" className="btn btn-save" disabled={saving}>
                    {saving
                      ? 'Saving...'
                      : dialogMode === 'create'
                      ? 'Create Lead'
                      : 'Save Changes'}
                  </button>
                )}
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default Leads;