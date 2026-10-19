import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FiEdit2,
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiFileText,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCalendar as FiCalendarIcon,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiShoppingBag,
  FiLayers,
  FiPrinter,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { customerAPI, orderAPI } from '../services/api';
import { sendOrderInvoiceViaWhatsApp, openWhatsApp } from '../utils/whatsapp';

const ViewCustomer = ({ onLogout }) => {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'measurement', 'ledger'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOutfits, setExpandedOutfits] = useState({});

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const toggleOutfitAccordion = (key) => {
    setExpandedOutfits((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await customerAPI.getCustomerById(customerId);
      const customerData = response?.Data || response;
      setCustomer(customerData);
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError(err?.response?.data?.Message || err?.message || 'Failed to fetch customer');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      setLoading(true);
      await orderAPI.cancelOrder(orderId);
      fetchCustomer();
    } catch (err) {
      console.error('Error deleting order:', err);
      alert(err?.response?.data?.Message || err?.message || 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    return value;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB');
      }
    } catch {}
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const customerOrders = useMemo(() => {
    return Array.isArray(customer?.orders) ? customer.orders : [];
  }, [customer]);

  // Financial summary calculations
  const totalBilled = useMemo(() => {
    return customerOrders.reduce((sum, o) => sum + Number(o?.totalPrice || o?.sellingPrice || 0), 0);
  }, [customerOrders]);

  const totalPaid = useMemo(() => {
    return customerOrders.reduce((sum, o) => sum + Number(o?.advanceAmount || o?.advancePayment || 0), 0);
  }, [customerOrders]);

  const totalDue = totalBilled - totalPaid;

  // Measurement logic: group orders by outfit type and take only the latest order with measurements
  const latestMeasurementsByOutfit = useMemo(() => {
    if (customerOrders.length === 0) return [];

    // Sort orders descending (most recent first)
    const sorted = [...customerOrders].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.deliveryDate || 0).getTime() || 0;
      const timeB = new Date(b.createdAt || b.deliveryDate || 0).getTime() || 0;
      return timeB - timeA;
    });

    const outfitCountMap = {};
    const latestMap = new Map();

    sorted.forEach((order) => {
      const outfitName = (
        order.outfitTypeName ||
        order.productName ||
        order.outfitTypeId?.name ||
        order.outfitType ||
        'Couture Outfit'
      ).trim();

      outfitCountMap[outfitName] = (outfitCountMap[outfitName] || 0) + 1;

      // Keep only the first (latest) occurrence that actually has measurement values
      if (!latestMap.has(outfitName) && Array.isArray(order.measurement) && order.measurement.length > 0) {
        latestMap.set(outfitName, {
          key: `${outfitName}_${order._id || order.orderId}`,
          outfitName,
          orderId: order.orderId || order._id || 'ORD',
          orderDate: order.createdAt || order.deliveryDate,
          deliveryDate: order.deliveryDate,
          measurement: order.measurement,
        });
      }
    });

    return Array.from(latestMap.values()).map((item) => ({
      ...item,
      totalRecorded: outfitCountMap[item.outfitName] || 1,
    }));
  }, [customerOrders]);

  // Auto-expand all outfit measurement accordions initially
  useEffect(() => {
    if (latestMeasurementsByOutfit.length > 0) {
      const initialExpanded = {};
      latestMeasurementsByOutfit.forEach((item) => {
        initialExpanded[item.key] = true;
      });
      setExpandedOutfits(initialExpanded);
    }
  }, [latestMeasurementsByOutfit]);

  if (loading) {
    return (
      <div className="mm-app-shell">
        <Sidebar onLogout={handleLogout} activePage="customers" />
        <main className="mm-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--primary-color)', fontSize: '15px', fontWeight: 600 }}>
            Loading customer profile & records...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mm-app-shell">
        <Sidebar onLogout={handleLogout} activePage="customers" />
        <main className="mm-main">
          <div
            style={{
              color: '#991B1B',
              background: '#FEF2F2',
              padding: '24px',
              borderRadius: '12px',
              margin: '24px',
              border: '1px solid #FECACA',
            }}
          >
            <p style={{ margin: '0 0 14px', fontWeight: 600 }}>{error}</p>
            <button className="mm-btn-primary" onClick={() => navigate('/customers')}>
              ← Back to Customers
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="mm-app-shell">
        <Sidebar onLogout={handleLogout} activePage="customers" />
        <main className="mm-main">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3>Customer record not found.</h3>
            <button className="mm-btn-primary" onClick={() => navigate('/customers')} style={{ marginTop: '16px' }}>
              ← Return to Customers
            </button>
          </div>
        </main>
      </div>
    );
  }

  const filteredOrders = customerOrders.filter((order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const oId = String(order.orderId || '').toLowerCase();
    const outfit = String(order.outfitTypeName || order.productName || order.outfitType || '').toLowerCase();
    return oId.includes(q) || outfit.includes(q);
  });

  const customerInitials = (customer.fullName || 'C')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="mm-app-shell">
      <Sidebar onLogout={handleLogout} activePage="customers" />

      <main className="mm-main">
        {/* Sticky Modern Topbar Header */}
        <header className="mm-topbar">
          <div className="mm-topbar-left">
            <button
              className="mm-btn-ghost"
              onClick={() => navigate('/customers')}
              style={{ padding: '6px 12px' }}
              title="Back to Customers List"
            >
              <FiArrowLeft size={16} /> Back
            </button>
            <div className="mm-breadcrumbs">
              <span className="mm-bc-root">Naari Art - Designer Studio</span>
              <span className="mm-bc-sep">/</span>
              <span className="mm-bc-sub">Customers</span>
              <span className="mm-bc-sep">/</span>
              <span className="mm-bc-cur">{customer.fullName || 'Customer Profile'}</span>
            </div>
          </div>
          <div className="mm-topbar-right">
            <div className="mm-studio-badge">
              <span className="mm-studio-dot" />
              <span>Couture Client Portfolio</span>
            </div>
            <button
              className="mm-btn-primary"
              onClick={() => navigate(`/customers/edit/${customerId}`)}
            >
              <FiEdit2 size={14} /> Edit Customer
            </button>
          </div>
        </header>

        <div className="mm-content">
          <div className="view-customer-layout">
            {/* Left Column - Modern Customer Profile Card */}
            <div className="view-customer-left-column">
              <div className="customer-details-card">
                {/* Profile Avatar & Name */}
                <div className="customer-profile-section">
                  <div className="customer-profile-image-wrapper">
                    {customer.profile_pic && !imageError ? (
                      <img
                        src={customer.profile_pic}
                        alt={customer.fullName}
                        className="customer-profile-image"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="customer-profile-avatar-monogram">
                        <span>{customerInitials}</span>
                      </div>
                    )}
                  </div>
                  <h2 className="customer-profile-name">{formatValue(customer.fullName)}</h2>
                  <span className="customer-type-pill">Couture Patron</span>
                </div>

                {/* Quick Financial Summary Chips */}
                <div className="customer-quick-stats">
                  <div className="c-stat-chip">
                    <span className="c-stat-label">Orders</span>
                    <span className="c-stat-val">{customerOrders.length}</span>
                  </div>
                  <div className="c-stat-chip">
                    <span className="c-stat-label">Total Spent</span>
                    <span className="c-stat-val">₹{totalBilled.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={`c-stat-chip ${totalDue > 0 ? 'due' : 'settled'}`}>
                    <span className="c-stat-label">Balance Due</span>
                    <span className="c-stat-val">₹{Math.max(0, totalDue).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Direct WhatsApp Callout Button */}
                {customer.mobile && (
                  <button
                    type="button"
                    className="customer-direct-whatsapp-btn"
                    onClick={() => {
                      const msg = `Namaste *${customer.fullName}* ji! 🙏\nGreetings from *Naari Art - Designer Studio, Surat*.\nHow may we assist you today regarding your bespoke order? ✨`;
                      openWhatsApp(customer.mobile, msg);
                    }}
                    title="Send WhatsApp Message"
                  >
                    <FaWhatsapp size={16} /> Chat on WhatsApp
                  </button>
                )}

                {/* Customer Details List */}
                <div className="customer-info-list">
                  <div className="customer-info-item">
                    <div className="c-info-icon-wrap"><FiPhone /></div>
                    <div>
                      <label className="customer-info-label">Phone / WhatsApp</label>
                      <p className="customer-info-value">{formatValue(customer.mobile)}</p>
                    </div>
                  </div>

                  <div className="customer-info-item address-item">
                    <div className="c-info-icon-wrap"><FiMapPin /></div>
                    <div>
                      <label className="customer-info-label">Address</label>
                      <p className="customer-info-value">{formatValue(customer.address)}</p>
                    </div>
                  </div>

                  <div className="customer-info-item">
                    <div className="c-info-icon-wrap"><FiUser /></div>
                    <div>
                      <label className="customer-info-label">Reference</label>
                      <p className="customer-info-value">{formatValue(customer.reference)}</p>
                    </div>
                  </div>

                  {customer.dob && (
                    <div className="customer-info-item">
                      <div className="c-info-icon-wrap"><FiCalendar /></div>
                      <div>
                        <label className="customer-info-label">Date of Birth</label>
                        <p className="customer-info-value">{formatDate(customer.dob)}</p>
                      </div>
                    </div>
                  )}

                  {customer.notes && (
                    <div className="customer-info-item address-item">
                      <div className="c-info-icon-wrap"><FiFileText /></div>
                      <div>
                        <label className="customer-info-label">Special Notes / Preferences</label>
                        <p className="customer-info-value">{formatValue(customer.notes)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Modern Tabs Navigation */}
            <div className="view-customer-right-column">
              <div className="customer-tabs-container">
                {/* Modern Pill Tab Navigation */}
                <div className="customer-tabs-navigation">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`customer-tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                  >
                    <FiShoppingBag size={15} />
                    <span>Orders</span>
                    <span className="tab-counter-pill">{customerOrders.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('measurement')}
                    className={`customer-tab-button ${activeTab === 'measurement' ? 'active' : ''}`}
                  >
                    <FiLayers size={15} />
                    <span>Measurement</span>
                    <span className="tab-counter-pill">{latestMeasurementsByOutfit.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ledger')}
                    className={`customer-tab-button ${activeTab === 'ledger' ? 'active' : ''}`}
                  >
                    <FiDollarSign size={15} />
                    <span>Ledger (ખાતાવહી)</span>
                    <span className="tab-counter-pill">{customerOrders.length}</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="customer-tabs-content">
                  {/* ──────────────── TAB 1: ORDERS ──────────────── */}
                  {activeTab === 'orders' && (
                    <div>
                      {/* Section Header */}
                      <div className="orders-section-header">
                        <div>
                          <h3 className="orders-section-title">Order History</h3>
                          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
                            All bespoke orders placed by {customer.fullName}
                          </p>
                        </div>
                        <div className="orders-search-container">
                          <FiSearch className="orders-search-icon" />
                          <input
                            type="text"
                            placeholder="Search by Order ID or Outfit..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="orders-search-input"
                          />
                        </div>
                      </div>

                      {filteredOrders.length > 0 ? (
                        <>
                          {/* Desktop Orders Table View */}
                          <div className="orders-table-container desktop-table-view">
                            <table className="orders-table mm-table">
                              <thead>
                                <tr>
                                  <th>No</th>
                                  <th>Order ID</th>
                                  <th>Outfit / Type</th>
                                  <th>Status</th>
                                  <th>Delivery Date</th>
                                  <th>Due Amount</th>
                                  <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredOrders.map((order, index) => {
                                  const total = Number(order.totalPrice || order.sellingPrice || 0);
                                  const adv = Number(order.advanceAmount || order.advancePayment || 0);
                                  const due = total - adv;
                                  const outfit = order.outfitTypeName || order.productName || order.outfitType || 'Customized';

                                  return (
                                    <tr key={order._id || index}>
                                      <td>{index + 1}</td>
                                      <td>
                                        <span className="order-id-code">{order.orderId || order._id}</span>
                                      </td>
                                      <td>
                                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{outfit}</div>
                                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{order.orderType || 'Custom'}</div>
                                      </td>
                                      <td>
                                        <span className={`order-status-badge ${String(order.status).toLowerCase().replace(/\s+/g, '_')}`}>
                                          {order.status || 'Pending'}
                                        </span>
                                      </td>
                                      <td>
                                        <div className="order-delivery-date">
                                          <FiCalendarIcon className="order-delivery-date-icon" />
                                          <span>{formatDate(order.deliveryDate)}</span>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="order-due-amount" style={{ fontWeight: 700, color: due > 0 ? '#DC2626' : '#16A34A' }}>
                                          ₹{Math.max(0, due).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                      </td>
                                      <td style={{ textAlign: 'right' }}>
                                        <div className="order-actions" style={{ justifyContent: 'flex-end' }}>
                                          <button
                                            type="button"
                                            className="mm-table-action-btn edit"
                                            onClick={() => navigate(`/orders/edit/${order._id}`)}
                                            title="Edit Order"
                                          >
                                            <FiEdit size={14} />
                                          </button>
                                          <button
                                            type="button"
                                            className="mm-table-action-btn view"
                                            onClick={() => navigate(`/orders/view/${order._id}`)}
                                            title="View Order Details"
                                          >
                                            <FiEye size={14} />
                                          </button>
                                          <button
                                            type="button"
                                            className="mm-table-action-btn whatsapp"
                                            onClick={() =>
                                              sendOrderInvoiceViaWhatsApp(
                                                { ...order, customerId: customer },
                                                customer.mobile
                                              )
                                            }
                                            title="Send Invoice via WhatsApp"
                                          >
                                            <FaWhatsapp size={15} />
                                          </button>
                                          <button
                                            type="button"
                                            className="mm-table-action-btn delete"
                                            onClick={() => handleCancelOrder(order._id)}
                                            title="Cancel / Delete Order"
                                          >
                                            <FiTrash2 size={14} />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Order Cards View (Table hidden on Mobile) */}
                          <div className="mobile-cards-view">
                            {filteredOrders.map((order, index) => {
                              const total = Number(order.totalPrice || order.sellingPrice || 0);
                              const adv = Number(order.advanceAmount || order.advancePayment || 0);
                              const due = total - adv;
                              const outfit = order.outfitTypeName || order.productName || order.outfitType || 'Customized';

                              return (
                                <div key={order._id || index} className="mobile-order-card">
                                  <div className="mobile-card-top">
                                    <div>
                                      <span className="order-id-code">{order.orderId || order._id}</span>
                                      <h4 className="mobile-card-outfit">{outfit}</h4>
                                    </div>
                                    <span className={`order-status-badge ${String(order.status).toLowerCase().replace(/\s+/g, '_')}`}>
                                      {order.status || 'Pending'}
                                    </span>
                                  </div>

                                  <div className="mobile-card-details">
                                    <div className="m-detail-row">
                                      <span className="m-detail-lbl">Delivery Date</span>
                                      <span className="m-detail-val">{formatDate(order.deliveryDate)}</span>
                                    </div>
                                    <div className="m-detail-row">
                                      <span className="m-detail-lbl">Total Value</span>
                                      <span className="m-detail-val">₹{total.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="m-detail-row">
                                      <span className="m-detail-lbl">Due Balance</span>
                                      <span className="m-detail-val" style={{ fontWeight: 800, color: due > 0 ? '#DC2626' : '#16A34A' }}>
                                        ₹{Math.max(0, due).toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mobile-card-actions">
                                    <button
                                      type="button"
                                      className="mm-table-action-btn edit"
                                      onClick={() => navigate(`/orders/edit/${order._id}`)}
                                      title="Edit Order"
                                    >
                                      <FiEdit size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      className="mm-table-action-btn view"
                                      onClick={() => navigate(`/orders/view/${order._id}`)}
                                      title="View Order"
                                    >
                                      <FiEye size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      className="mm-table-action-btn whatsapp"
                                      onClick={() =>
                                        sendOrderInvoiceViaWhatsApp(
                                          { ...order, customerId: customer },
                                          customer.mobile
                                        )
                                      }
                                      title="Send WhatsApp Invoice"
                                    >
                                      <FaWhatsapp size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      className="mm-table-action-btn delete"
                                      onClick={() => handleCancelOrder(order._id)}
                                      title="Delete"
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="no-measurements-section">
                          <FiShoppingBag className="no-measurements-icon" />
                          <p className="no-measurements-text">
                            {searchQuery ? 'No orders match your search criteria.' : 'No orders recorded for this customer yet.'}
                          </p>
                          <Link to="/orders/add" className="mm-btn-primary" style={{ marginTop: '12px', display: 'inline-flex' }}>
                            + Create First Order
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ──────────────── TAB 2: MEASUREMENT (LATEST ONLY PER OUTFIT) ──────────────── */}
                  {activeTab === 'measurement' && (
                    <div className="measurement-section">
                      <div className="orders-section-header">
                        <div>
                          <h3 className="orders-section-title">Latest Outfit Measurements</h3>
                          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
                            Automatically displaying only the most recent measurement recorded for each garment type.
                          </p>
                        </div>
                      </div>

                      {latestMeasurementsByOutfit.length > 0 ? (
                        <div className="orders-accordion">
                          {latestMeasurementsByOutfit.map((item) => {
                            const isExpanded = expandedOutfits[item.key] !== false;

                            return (
                              <div key={item.key} className="order-accordion-item outfit-measurement-card">
                                <div
                                  className="order-accordion-header"
                                  onClick={() => toggleOutfitAccordion(item.key)}
                                >
                                  <div className="order-accordion-title">
                                    <span className="order-name">{item.outfitName}</span>
                                    <span className="latest-badge-pill">
                                      <FiCheckCircle size={12} /> Latest Measurement
                                    </span>
                                    <span className="order-source-tag">
                                      Order #{item.orderId} • {formatDate(item.deliveryDate || item.orderDate)}
                                    </span>
                                    {item.totalRecorded > 1 && (
                                      <span className="version-archived-tag">
                                        (Archived {item.totalRecorded - 1} earlier {item.outfitName} measurement{item.totalRecorded - 1 > 1 ? 's' : ''})
                                      </span>
                                    )}
                                  </div>
                                  <span className="accordion-icon">
                                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                  </span>
                                </div>

                                {isExpanded && (
                                  <div className="order-accordion-content">
                                    <div className="measurement-grid">
                                      {item.measurement.map((m, mIdx) => (
                                        <div key={mIdx} className="measurement-item">
                                          <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                                              {m.fieldLable || m.label || 'Measurement'} {m.unit ? `(${m.unit})` : ''}
                                            </label>
                                            <input
                                              type="text"
                                              className="input-field"
                                              value={m.fieldValue === '0' ? '' : m.fieldValue || '-'}
                                              disabled
                                              style={{ background: '#F8FAFC', fontWeight: 700, color: '#1E293B', cursor: 'default' }}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="no-measurements-section">
                          <FiLayers className="no-measurements-icon" />
                          <p className="no-measurements-text">
                            No measurements have been recorded for this customer’s orders yet.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ──────────────── TAB 3: LEDGER (ખાતાવહી / PAYMENT DETAILS) ──────────────── */}
                  {activeTab === 'ledger' && (
                    <div className="customer-ledger-section">
                      {/* Section Header */}
                      <div className="orders-section-header">
                        <div>
                          <h3 className="orders-section-title">Client Payment Ledger (ખાતાવહી)</h3>
                          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
                            Detailed accounting of all payments received, advances, and remaining balances for {customer.fullName}.
                          </p>
                        </div>
                      </div>

                      {/* 3 KPI Summary Cards */}
                      <div className="ledger-kpi-grid">
                        <div className="ledger-kpi-card total-billed">
                          <span className="ledger-kpi-label">Total Invoiced</span>
                          <div className="ledger-kpi-value">₹ {totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          <span className="ledger-kpi-sub">{customerOrders.length} total orders</span>
                        </div>

                        <div className="ledger-kpi-card total-paid">
                          <span className="ledger-kpi-label">Payment Received</span>
                          <div className="ledger-kpi-value">₹ {totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          <span className="ledger-kpi-sub">Advance & full payments</span>
                        </div>

                        <div className={`ledger-kpi-card total-due ${totalDue > 0 ? 'has-due' : 'settled'}`}>
                          <span className="ledger-kpi-label">Net Balance Due</span>
                          <div className="ledger-kpi-value">₹ {Math.max(0, totalDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          <span className="ledger-kpi-sub">
                            {totalDue > 0 ? '⚠️ Outstanding balance' : '✓ All accounts fully settled'}
                          </span>
                        </div>
                      </div>

                      {customerOrders.length > 0 ? (
                        <>
                          {/* Desktop Ledger Table */}
                          <div className="orders-table-container desktop-table-view" style={{ marginTop: '20px' }}>
                            <table className="orders-table mm-table">
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Order / Inv No</th>
                                  <th>Outfit Description</th>
                                  <th>Order Value</th>
                                  <th>Amount Received</th>
                                  <th>Balance Due</th>
                                  <th>Payment Status</th>
                                  <th style={{ textAlign: 'right' }}>Receipt & Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customerOrders.map((order, idx) => {
                                  const total = Number(order.totalPrice || order.sellingPrice || 0);
                                  const adv = Number(order.advanceAmount || order.advancePayment || 0);
                                  const due = total - adv;
                                  const outfit = order.outfitTypeName || order.productName || order.outfitType || 'Bespoke Outfit';
                                  const isSettled = due <= 0;
                                  const isPartial = adv > 0 && due > 0;

                                  return (
                                    <tr key={order._id || idx}>
                                      <td>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                                          {formatDate(order.createdAt || order.deliveryDate)}
                                        </div>
                                      </td>
                                      <td>
                                        <span className="order-id-code">{order.orderId || order._id}</span>
                                      </td>
                                      <td>
                                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{outfit}</div>
                                      </td>
                                      <td>
                                        <div style={{ fontWeight: 600, color: '#1E293B' }}>
                                          ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ fontWeight: 700, color: '#16A34A' }}>
                                          ₹{adv.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ fontWeight: 700, color: due > 0 ? '#DC2626' : '#16A34A' }}>
                                          ₹{Math.max(0, due).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                      </td>
                                      <td>
                                        <span className={`ledger-status-pill ${isSettled ? 'settled' : isPartial ? 'partial' : 'unpaid'}`}>
                                          {isSettled ? '✓ Fully Paid' : isPartial ? 'Partial Paid' : 'Pending Payment'}
                                        </span>
                                      </td>
                                      <td style={{ textAlign: 'right' }}>
                                        <div className="order-actions" style={{ justifyContent: 'flex-end' }}>
                                          <button
                                            type="button"
                                            className="mm-table-action-btn whatsapp"
                                            onClick={() =>
                                              sendOrderInvoiceViaWhatsApp(
                                                { ...order, customerId: customer },
                                                customer.mobile
                                              )
                                            }
                                            title="Send WhatsApp Invoice Receipt"
                                          >
                                            <FaWhatsapp size={15} />
                                          </button>
                                          <button
                                            type="button"
                                            className="mm-table-action-btn view"
                                            onClick={() => navigate(`/orders/view/${order._id}`)}
                                            title="View Order"
                                          >
                                            <FiEye size={14} />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Ledger Cards View */}
                          <div className="mobile-cards-view" style={{ marginTop: '16px' }}>
                            {customerOrders.map((order, idx) => {
                              const total = Number(order.totalPrice || order.sellingPrice || 0);
                              const adv = Number(order.advanceAmount || order.advancePayment || 0);
                              const due = total - adv;
                              const outfit = order.outfitTypeName || order.productName || order.outfitType || 'Bespoke Outfit';
                              const isSettled = due <= 0;
                              const isPartial = adv > 0 && due > 0;

                              return (
                                <div key={order._id || idx} className="mobile-order-card">
                                  <div className="mobile-card-top">
                                    <div>
                                      <span className="order-id-code">{order.orderId || order._id}</span>
                                      <h4 className="mobile-card-outfit">{outfit}</h4>
                                    </div>
                                    <span className={`ledger-status-pill ${isSettled ? 'settled' : isPartial ? 'partial' : 'unpaid'}`}>
                                      {isSettled ? 'Fully Paid' : isPartial ? 'Partial Paid' : 'Pending'}
                                    </span>
                                  </div>

                                  <div className="mobile-card-details">
                                    <div className="m-detail-row">
                                      <span className="m-detail-lbl">Transaction Date</span>
                                      <span className="m-detail-val">{formatDate(order.createdAt || order.deliveryDate)}</span>
                                    </div>
                                    <div className="m-detail-row">
                                      <span className="m-detail-lbl">Order Value</span>
                                      <span className="m-detail-val">₹{total.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="m-detail-row">
                                      <span className="m-detail-lbl">Payment Received</span>
                                      <span className="m-detail-val" style={{ color: '#16A34A', fontWeight: 700 }}>
                                        ₹{adv.toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                    <div className="m-detail-row">
                                      <span className="m-detail-lbl">Remaining Balance</span>
                                      <span className="m-detail-val" style={{ color: due > 0 ? '#DC2626' : '#16A34A', fontWeight: 800 }}>
                                        ₹{Math.max(0, due).toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mobile-card-actions">
                                    <button
                                      type="button"
                                      className="mm-btn-secondary"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                                      onClick={() => navigate(`/orders/view/${order._id}`)}
                                    >
                                      <FiEye size={13} /> View Order
                                    </button>
                                    <button
                                      type="button"
                                      className="mm-btn-primary"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px', background: '#25D366', borderColor: '#25D366' }}
                                      onClick={() =>
                                        sendOrderInvoiceViaWhatsApp(
                                          { ...order, customerId: customer },
                                          customer.mobile
                                        )
                                      }
                                    >
                                      <FaWhatsapp size={14} /> Send WhatsApp Receipt
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="no-measurements-section">
                          <FiDollarSign className="no-measurements-icon" />
                          <p className="no-measurements-text">No payment records found for this customer.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewCustomer;
