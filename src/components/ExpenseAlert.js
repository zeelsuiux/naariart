import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles.css';
import { storage } from '../utils/storage';
import { expenseAlertAPI } from '../services/api';
import { FiCheck, FiEdit2, FiPlus, FiSearch, FiTrash2, FiChevronUp, FiChevronDown, FiChevronsUp, FiAlertTriangle } from 'react-icons/fi';

const ExpenseAlert = ({ onLogout }) => {
  const navigate = useNavigate();

  const [expenseAlerts, setExpenseAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialForm = {
    expenseAlertId: '',
    name: '',
    description: '',
    amount: '',
    dueDate: '',
  };
  const [formData, setFormData] = useState(initialForm);


  const fetchExpenseAlerts = async (searchText = '') => {
    try {
      setLoading(true);
      setError('');

      const response =
        await expenseAlertAPI.getExpenseAlerts(searchText);

      setExpenseAlerts(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchExpenseAlerts(search);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const isFormValid =
    formData.name.trim() !== '' &&
    formData.description.trim() !== '' &&
    formData.amount !== '' &&
    Number(formData.amount) > 0 &&
    formData.dueDate.trim() !== '';

  const handleSaveExpense = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      setSaving(true);

      await expenseAlertAPI.saveExpenseAlert(formData);

      setShowModal(false);
      setFormData(initialForm);

      fetchExpenseAlerts(search);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;

    try {
      await expenseAlertAPI.deleteExpenseAlert(id);
      fetchExpenseAlerts(search);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await expenseAlertAPI.markExpenseAlertPaid(id);
      fetchExpenseAlerts(search);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [sortConfig, setSortConfig] = useState({
    key: '',
    direction: 'asc',
  });

  const handleSort = (key) => {
    let direction = 'asc';

    if (
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }

    setSortConfig({
      key,
      direction,
    });
  };

  const sortedExpenseAlerts = [...expenseAlerts].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === 'amount') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    } else {
      aValue = (aValue || '').toString().toLowerCase();
      bValue = (bValue || '').toString().toLowerCase();
    }

    if (aValue < bValue)
      return sortConfig.direction === 'asc' ? -1 : 1;

    if (aValue > bValue)
      return sortConfig.direction === 'asc' ? 1 : -1;

    return 0;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FiChevronsUp size={14} style={{ opacity: 0.4 }} />;
    }

    return sortConfig.direction === 'asc' ? (
      <FiChevronUp size={14} />
    ) : (
      <FiChevronDown size={14} />
    );
  };

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setShowModal(true);
  };

  return (
    <div className="mm-app-shell">
      <Sidebar onLogout={handleLogout} activePage="alert" />

      <main className="mm-main">
        {/* Sticky Modern Topbar */}
        <header className="mm-topbar">
          <div className="mm-topbar-left">
            <div className="mm-breadcrumbs">
              <span className="mm-bc-root">Naari Art</span>
              <span className="mm-bc-sep">/</span>
              <span className="mm-bc-cur">Expense Alerts</span>
            </div>
          </div>
          <div className="mm-topbar-right">
            <div className="mm-studio-badge">
              <span className="mm-studio-dot" />
              <span>Naari Couture Studio</span>
            </div>
            <button className="mm-btn-primary" onClick={handleOpenAdd}>
              <FiPlus size={15} /> Add Expense
            </button>
          </div>
        </header>

        <div className="mm-content">
          {error && (
            <div className="error-banner" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <div className="mm-table-card">
            <div className="mm-module-header">
              <div className="mm-header-left">
                <div className="mm-header-icon-badge">
                  <FiAlertTriangle size={20} />
                </div>
                <div className="mm-header-title-group">
                  <div className="mm-header-title-row">
                    <h2>Expense Alerts</h2>
                    <span className="mm-count-pill">{expenseAlerts.length} Alerts</span>
                  </div>
                  <p className="mm-header-subtitle">
                    Monitor recurring atelier bills, fabric invoices, and upcoming budget expenses
                  </p>
                </div>
              </div>
              <div className="mm-header-right">
                <div className="mm-search-bar">
                  <FiSearch className="search-icon" size={14} />
                  <input
                    type="text"
                    placeholder="Search Expense..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="mm-btn-primary" onClick={handleOpenAdd}>
                  <FiPlus size={15} /> Add Expense
                </button>
              </div>
            </div>

          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: 'var(--primary-color)',
              }}
            >
              Loading expense alerts...
            </div>
          ) : expenseAlerts.length > 0 ? (
            <div className="table-container">
              <div className="table-scroll-wrapper">
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}
                >
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('dueDate')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          Date
                          {renderSortIcon('dueDate')}
                        </div>
                      </th>

                      <th onClick={() => handleSort('name')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          Name
                          {renderSortIcon('name')}
                        </div>
                      </th>

                      <th onClick={() => handleSort('amount')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          Amount
                          {renderSortIcon('amount')}
                        </div>
                      </th>

                      <th onClick={() => handleSort('description')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          Description
                          {renderSortIcon('description')}
                        </div>
                      </th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedExpenseAlerts.map((item, index) => (
                      <tr
                        key={item._id || index}
                        style={{
                          borderBottom:
                            '1px solid var(--border-color)',
                        }}
                      >
                        <td>{item.dueDate || '-'}</td>
                        <td>{item.name || '-'}</td>
                        <td>₹ {item.amount || 0}</td>
                        <td>{item.description || '-'}</td>
                        <td style={{ display: 'flex', gap: 8 }}>

                          <button
                            className="edit-btn"
                            title='Edit'
                            onClick={() => {
                              setFormData({
                                expenseAlertId: item.expenseAlertId || item._id,
                                name: item.name || '',
                                description: item.description || '',
                                amount: item.amount || '',
                                dueDate: item.dueDate || '',
                              });

                              setShowModal(true);
                            }}
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            className="delete-btn"
                            title='Delete'
                            onClick={() =>
                              handleDelete(item.expenseAlertId || item._id)
                            }
                          >
                            <FiTrash2 />
                          </button>

                          <button
                            className="paid-btn"
                            title='Mark Paid'
                            onClick={() =>
                              handleMarkPaid(item.expenseAlertId || item._id)
                            }
                          >
                            <FiCheck />
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mm-table-state">
              <div className="state-title">No Expense Alerts Found</div>
              <div className="state-desc">Set up recurring workshop alerts, vendor payments, and bills.</div>
              <button className="mm-btn-primary" onClick={handleOpenAdd}>
                <FiPlus size={15} /> Add Expense Alert
              </button>
            </div>
          )}
          </div>
        </div>
      </main>
      {showModal && (
        <div className="modal-overlay">
          <div className='modal'>
            <div className='modal-header'>
              <h2 style={{ marginBottom: 20 }}>
                {formData.expenseAlertId ? 'Edit Expense' : 'Add Expense'}
              </h2>
            </div>

            <form onSubmit={handleSaveExpense}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-input"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    className="form-input"
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    className="form-input"
                    type="date"
                    placeholder="DD-MM-YYYY"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>
              <div className="modal-footer">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 10,
                    marginTop: 20,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={() => {
                      setShowModal(false);
                      setFormData(initialForm);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-save"
                    disabled={!isFormValid || saving}
                    style={{
                      opacity: !isFormValid || saving ? 0.6 : 1,
                      cursor: !isFormValid || saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseAlert;

