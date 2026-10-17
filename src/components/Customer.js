import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiEye,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiTag,
  FiGrid,
  FiList,
  FiUpload,
} from 'react-icons/fi';
import Sidebar from './Sidebar.js';
import { customerAPI } from '../services/api.js';
import { storage } from '../utils/storage';
import '../styles.css';
import Pagination from './Pagination.js';
import BulkCustomerImportModal from './BulkCustomerImportModal.js';

const Customer = ({ onLogout }) => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const itemsPerPage = 8;
  const isAdmin = storage.isAdmin();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await customerAPI.getCustomers('');
      if (data) {
        setCustomers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err?.response?.data?.Message || 'Failed to fetch customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const permissions = JSON.parse(localStorage.getItem('naari_permissions')) || [];
  const customerPermission = permissions.find((item) => item.collectionName === 'customers');
  const canAddEdit = isAdmin || customerPermission?.insertUpdate || false;
  const canView = isAdmin || customerPermission?.view || true;

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1]}-${parts[2]}`;
    }
    return dateStr;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Client-side search with universal phone number matching + multi-field match
  const filteredCustomers = useMemo(() => {
    let list = [...customers];
    const query = searchQuery.trim().toLowerCase();
    const cleanDigits = query.replace(/\D/g, '');

    if (query) {
      list = list.filter((customer) => {
        const phoneDigits = String(customer.mobile || customer.phone || '').replace(/\D/g, '');
        const phoneMatch = cleanDigits && phoneDigits.includes(cleanDigits);

        const textMatch = [
          customer.fullName,
          customer.name,
          customer.mobile,
          customer.reference,
          customer.address,
          customer.notes,
        ].some((val) => String(val || '').toLowerCase().includes(query));

        return phoneMatch || textMatch;
      });
    }

    // Sort list
    list.sort((a, b) => {
      if (sortField === 'name') {
        const nameA = (a.fullName || '').toLowerCase();
        const nameB = (b.fullName || '').toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else if (sortField === 'phone') {
        const pA = String(a.mobile || '');
        const pB = String(b.mobile || '');
        return sortOrder === 'asc' ? pA.localeCompare(pB) : pB.localeCompare(pA);
      } else if (sortField === 'date') {
        const dA = new Date(a.created_at || a.createdAt || 0).getTime();
        const dB = new Date(b.created_at || b.createdAt || 0).getTime();
        return sortOrder === 'asc' ? dA - dB : dB - dA;
      }
      return 0;
    });

    return list;
  }, [customers, searchQuery, sortField, sortOrder]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  return (
    <div className="mm-app-shell">
      <Sidebar onLogout={handleLogout} activePage="customers" />

      <main className="mm-main">
        {/* Sticky Modern Topbar */}
        <header className="mm-topbar">
          <div className="mm-topbar-left">
            <div className="mm-breadcrumbs">
              <span className="mm-bc-root">Naari Art</span>
              <span className="mm-bc-sep">/</span>
              <span className="mm-bc-cur">Customers</span>
            </div>
          </div>
          <div className="mm-topbar-right">
            <div className="mm-studio-badge">
              <span className="mm-studio-dot" />
              <span>Naari Couture Studio</span>
            </div>

            {/* Bulk Excel Upload Button for Master Admin */}
            {isAdmin && (
              <button
                type="button"
                className="mm-btn-ghost"
                onClick={() => setIsBulkModalOpen(true)}
                title="Bulk import customers via Excel"
                id="btn-bulk-import-customer"
              >
                <FiUpload size={14} /> Bulk Import Excel
              </button>
            )}

            {canAddEdit && (
              <button
                type="button"
                className="mm-btn-primary"
                onClick={() => navigate('/customers/add')}
                id="btn-add-customer"
              >
                <FiPlus size={16} /> + Add Customer
              </button>
            )}
          </div>
        </header>

        <div className="mm-content">
          {error && (
            <div className="error-banner" style={{ marginBottom: '20px' }}>
              {error}
              <button onClick={() => setError('')} className="close-error">
                ×
              </button>
            </div>
          )}

          {/* Modern Card / Panel */}
          <div className="mm-table-card">
            {/* My Metaji Module Header */}
            <div className="mm-module-header">
              <div className="mm-header-left">
                <div className="mm-header-icon-badge">
                  <FiUsers size={20} />
                </div>
                <div className="mm-header-title-group">
                  <div className="mm-header-title-row">
                    <h2>Customer Directory</h2>
                    <span className="mm-count-pill">{filteredCustomers.length} Clients</span>
                  </div>
                  <p className="mm-header-subtitle">
                    Manage client profiles, measurements, and personalized styling records
                  </p>
                </div>
              </div>

              <div className="mm-header-right">
                {canAddEdit && (
                  <button
                    type="button"
                    className="mm-btn-primary mm-header-action-btn"
                    onClick={() => navigate('/customers/add')}
                    title="Add Customer"
                  >
                    <FiPlus size={15} /> + Add Customer
                  </button>
                )}

                {/* View Switcher */}
                <div className="mm-view-toggle">
                  <button
                    type="button"
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                    title="Grid Card View"
                  >
                    <FiGrid size={13} /> Cards
                  </button>
                  <button
                    type="button"
                    className={viewMode === 'table' ? 'active' : ''}
                    onClick={() => setViewMode('table')}
                    title="Table List View"
                  >
                    <FiList size={13} /> Table
                  </button>
                </div>

                {/* Search Bar (Universal phone & name search) */}
                <div className="mm-search-bar">
                  <FiSearch className="search-icon" size={14} />
                  <input
                    type="text"
                    placeholder="Search by name, phone number..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="mm-table-state">
                <div className="state-desc">Loading customer directory...</div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="mm-table-state">
                <div className="state-title">No customers found</div>
                <div className="state-desc">
                  {searchQuery
                    ? 'No clients matched your search query. Try searching by phone number.'
                    : 'Get started by creating your first client profile or importing from Excel.'}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  {isAdmin && (
                    <button
                      type="button"
                      className="mm-btn-ghost"
                      onClick={() => setIsBulkModalOpen(true)}
                    >
                      <FiUpload size={14} /> Bulk Import Excel
                    </button>
                  )}
                  {canAddEdit && (
                    <button
                      type="button"
                      className="mm-btn-primary"
                      onClick={() => navigate('/customers/add')}
                    >
                      <FiPlus size={15} /> + Add Customer
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid Card View */
              <div className="mm-cust-grid">
                {currentCustomers.map((customer) => (
                  <div key={customer._id} className="mm-card">
                    <div className="mm-cust-card-top">
                      <div className="mm-cust-avatar-lg">
                        {customer.profile_pic ? (
                          <img src={customer.profile_pic} alt={customer.fullName} />
                        ) : (
                          getInitials(customer.fullName)
                        )}
                      </div>
                      <div className="mm-cust-info">
                        <h3 className="mm-cust-name" title={customer.fullName}>
                          {customer.fullName}
                        </h3>
                        {customer.reference ? (
                          <span className="mm-cust-tag">
                            <FiTag size={10} /> {customer.reference}
                          </span>
                        ) : (
                          <span
                            className="mm-cust-tag"
                            style={{
                              color: '#64748B',
                              borderColor: '#E2E8F0',
                              background: '#F8FAFC',
                            }}
                          >
                            Direct Client
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mm-cust-details">
                      <div className="mm-cust-detail-row">
                        <FiPhone size={14} />
                        {customer.mobile ? (
                          <a href={`tel:${customer.mobile}`}>{customer.mobile}</a>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                      {customer.dob && (
                        <div className="mm-cust-detail-row">
                          <FiCalendar size={14} />
                          <span>{formatDate(customer.dob)}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="mm-cust-detail-row">
                          <FiMapPin size={14} />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {customer.address}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mm-cust-actions">
                      {canView && (
                        <button
                          type="button"
                          className="mm-btn-ghost primary-tint"
                          onClick={() => navigate(`/customers/view/${customer._id}`)}
                          title="View Details"
                        >
                          <FiEye size={13} /> View
                        </button>
                      )}
                      {canAddEdit && (
                        <button
                          type="button"
                          className="mm-btn-ghost"
                          onClick={() => navigate(`/customers/edit/${customer._id}`)}
                          title="Edit Customer"
                        >
                          <FiEdit2 size={13} /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Table List View (with Desktop Table & Adaptive Mobile Cards) */
              <>
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
                          Customer Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th
                          onClick={() => {
                            setSortField('phone');
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          Contact Number {sortField === 'phone' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Reference</th>
                        <th>Location</th>
                        <th>Birth Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCustomers.map((customer) => (
                        <tr key={customer._id}>
                          <td>
                            <div className="mm-customer-cell">
                              <div className="customer-avatar-sm">
                                {getInitials(customer.fullName)}
                              </div>
                              <div>
                                <div className="customer-name-text">{customer.fullName}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {customer.mobile ? (
                              <a href={`tel:${customer.mobile}`} className="mm-order-link">
                                {customer.mobile}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            <span className="mm-outfit-tag">
                              {customer.reference || 'Direct'}
                            </span>
                          </td>
                          <td>{customer.address || '-'}</td>
                          <td>{formatDate(customer.dob)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              {canView && (
                                <button
                                  type="button"
                                  className="mm-table-action-btn"
                                  onClick={() => navigate(`/customers/view/${customer._id}`)}
                                  title="View Details"
                                >
                                  <FiEye size={14} />
                                </button>
                              )}
                              {canAddEdit && (
                                <button
                                  type="button"
                                  className="mm-table-action-btn"
                                  onClick={() => navigate(`/customers/edit/${customer._id}`)}
                                  title="Edit Customer"
                                >
                                  <FiEdit2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card Grid */}
                <div className="mobile-card-grid">
                  {currentCustomers.map((customer) => (
                    <div
                      key={customer._id}
                      className="mobile-record-card"
                      onClick={() => navigate(`/customers/view/${customer._id}`)}
                    >
                      <div className="mobile-card-header">
                        <div className="mobile-card-avatar">
                          {getInitials(customer.fullName)}
                        </div>
                        <div className="mobile-card-header-info">
                          <h4 className="mobile-card-title">{customer.fullName}</h4>
                          <span className="mobile-card-sub">
                            {customer.reference || 'Direct Client'}
                          </span>
                        </div>
                      </div>

                      <div className="mobile-card-body">
                        <div className="mobile-card-prop">
                          <span className="mobile-prop-label">Phone:</span>
                          <a
                            href={`tel:${customer.mobile}`}
                            className="mobile-prop-val text-brand"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {customer.mobile || '-'}
                          </a>
                        </div>
                        {customer.address && (
                          <div className="mobile-card-prop">
                            <span className="mobile-prop-label">Address:</span>
                            <span className="mobile-prop-val">{customer.address}</span>
                          </div>
                        )}
                        {customer.dob && (
                          <div className="mobile-card-prop">
                            <span className="mobile-prop-label">DOB:</span>
                            <span className="mobile-prop-val">{formatDate(customer.dob)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mobile-card-footer" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="mobile-card-action-btn"
                          onClick={() => navigate(`/customers/view/${customer._id}`)}
                        >
                          <FiEye size={13} /> View
                        </button>
                        {canAddEdit && (
                          <button
                            type="button"
                            className="mobile-card-action-btn primary"
                            onClick={() => navigate(`/customers/edit/${customer._id}`)}
                          >
                            <FiEdit2 size={13} /> Edit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid #EEF2F6',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bulk Customer Import Modal */}
      <BulkCustomerImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          setIsBulkModalOpen(false);
          fetchCustomers();
        }}
      />
    </div>
  );
};

export default Customer;
