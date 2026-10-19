import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiEdit2, FiArrowLeft, FiUser, FiPhone, FiMapPin, FiCalendar, FiFileText, FiSearch, FiEdit, FiTrash2, FiEye, FiCalendar as FiCalendarIcon, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { customerAPI } from '../services/api';
import { orderAPI } from '../services/api';

const ViewCustomer = ({ onLogout }) => {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const toggleOrderAccordion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await customerAPI.getCustomerById(customerId);
      // Handle API response structure where actual data is in response.Data
      const customerData = response.Data || response;
      setCustomer(customerData);
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError((err?.response?.data?.Message || err?.message) || 'Failed to fetch customer');
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
      fetchCustomer(); // Refresh orders after deletion
    } catch (err) {
      console.error('Error deleting order:', err);
      alert((err?.response?.data?.Message || err?.message) || 'Failed to delete order');
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
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  if (loading) {
    return (
      <div className="mm-app-shell">
        <Sidebar onLogout={handleLogout} activePage="customers" />
        <main className="mm-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Loading customer details...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mm-app-shell">
        <Sidebar onLogout={handleLogout} activePage="customers" />
        <main className="mm-main">
          <div style={{
            color: 'var(--alert-color)',
            background: 'rgba(255, 0, 0, 0.1)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            margin: '20px',
            border: '1px solid rgba(255, 0, 0, 0.2)'
          }}>
            {error}
            <button
              className="mm-btn-primary"
              onClick={() => navigate('/customers')}
              style={{ marginLeft: '12px' }}
            >
              Back to Customers
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
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Customer not found</p>
            <button className="mm-btn-primary" onClick={() => navigate('/customers')}>
              Back to Customers
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="mm-app-shell">
      <Sidebar onLogout={handleLogout} activePage="customers" />

      <main className="mm-main">
        {/* Sticky Modern Topbar */}
        <header className="mm-topbar">
          <div className="mm-topbar-left">
            <button
              className="mm-btn-ghost"
              onClick={() => navigate('/customers')}
              style={{ padding: '6px 12px' }}
              title="Back to Customers"
            >
              <FiArrowLeft size={16} /> Back
            </button>
            <div className="mm-breadcrumbs">
              <span className="mm-bc-root">Naari Art</span>
              <span className="mm-bc-sep">/</span>
              <span className="mm-bc-cur">{customer.fullName || 'Customer Profile'}</span>
            </div>
          </div>
          <div className="mm-topbar-right">
            <div className="mm-studio-badge">
              <span className="mm-studio-dot" />
              <span>Naari Couture Studio</span>
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
          {/* Left Column - Customer Details */}
          <div className="view-customer-left-column">
            <div className="customer-details-card">
              {/* Profile Section */}
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
                    <div className="customer-profile-avatar">
                      <FiUser style={{ fontSize: '40px' }} />
                    </div>
                  )}
                </div>
                <h2 className="customer-profile-name">
                  {formatValue(customer.fullName)}
                </h2>
              </div>

              {/* Customer Details */}
              <div className="customer-info-list">
                <div className="customer-info-item">
                  <FiPhone className="customer-info-icon" />
                  <div>
                    <label className="customer-info-label">Phone</label>
                    <p className="customer-info-value">{formatValue(customer.mobile)}</p>
                  </div>
                </div>

                <div className="customer-info-item address-item">
                  <FiMapPin className="customer-info-icon address-icon" />
                  <div>
                    <label className="customer-info-label">Address</label>
                    <p className="customer-info-value">{formatValue(customer.address)}</p>
                  </div>
                </div>

                <div className="customer-info-item">
                  <FiUser className="customer-info-icon" />
                  <div>
                    <label className="customer-info-label">Reference</label>
                    <p className="customer-info-value">{formatValue(customer.reference)}</p>
                  </div>
                </div>

                {customer.dob && (
                  <div className="customer-info-item">
                    <FiCalendar className="customer-info-icon" />
                    <div>
                      <label className="customer-info-label">Date of Birth</label>
                      <p className="customer-info-value">{formatDate(customer.dob)}</p>
                    </div>
                  </div>
                )}

                {customer.notes && (
                  <div className="customer-info-item address-item">
                    <FiFileText className="customer-info-icon" />
                    <div>
                      <label className="customer-info-label">Notes</label>
                      <p className="customer-info-value">{formatValue(customer.notes)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="view-customer-right-column">
            <div className="customer-tabs-container">
              {/* Tab Navigation */}
              <div className="customer-tabs-navigation">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`customer-tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('measurement')}
                  className={`customer-tab-button ${activeTab === 'measurement' ? 'active' : ''}`}
                >
                  Measurement
                </button>
              </div>

              {/* Tab Content */}
              <div className="customer-tabs-content">
                {activeTab === 'orders' && (
                  <div>
                    {/* Search Bar */}
                    <div className="orders-section-header">
                      <h3 className="orders-section-title">Orders</h3>
                      <div className="orders-search-container">
                        <FiSearch className="orders-search-icon" />
                        <input
                          type="text"
                          placeholder="Search Order No...."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="orders-search-input"
                        />
                      </div>
                    </div>

                    {/* Orders Table */}
                    <div className="orders-table-container">
                      <table className="orders-table">
                        <thead>
                          <tr>
                            <th>No</th>
                            <th>Order ID</th>
                            <th>Order Type</th>
                            <th>Status</th>
                            <th>Delivery Date</th>
                            <th>Due Amount</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customer && customer.orders && customer.orders.filter(order =>
                            searchQuery === '' || order.orderId.toLowerCase().includes(searchQuery.toLowerCase())
                          ).map((order, index) => (
                            <tr key={order._id}>
                              <td>{index + 1}</td>
                              <td>{order.orderId}</td>
                              <td>{order.orderType}</td>
                              <td>
                                <span className={`order-status-badge ${order.status}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </td>
                              <td>
                                <div className="order-delivery-date">
                                  <FiCalendarIcon className="order-delivery-date-icon" />
                                  {order.deliveryDate
                                    ? new Date(order.deliveryDate).toLocaleDateString('en-GB')
                                    : '-'}
                                </div>
                              </td>
                              <td>
                                <div className="order-due-amount">
                                  ₹{(order.totalPrice - (order.advanceAmount || 0)).toFixed(2)}
                                </div>
                              </td>
                              <td>
                                <div className="order-actions">
                                  <button className="order-action-button edit" onClick={() => navigate(`/orders/edit/${order._id}`)}
                                    title="Edit">
                                    <FiEdit size={16} />
                                  </button>
                                  <button className="order-action-button delete" onClick={() => handleCancelOrder(order._id)}
                                    title="Delete">
                                    <FiTrash2 size={16} />
                                  </button>
                                  <button className="order-action-button view" onClick={() => navigate(`/orders/view/${order._id}`)}
                                    title="View">
                                    <FiEye size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'measurement' && (
                  <div className="measurement-section">
                    {customer && customer.orders && customer.orders.length > 0 ? (
                      <div className="orders-accordion">
                        {customer.orders.map((order, orderIndex) => (
                          <div key={order._id} className="order-accordion-item">
                            <div
                              className="order-accordion-header"
                              onClick={() => toggleOrderAccordion(order._id)}
                            >
                              <div className="order-accordion-title">
                                {/* <span className="order-id">{order.orderId}</span> */}
                                <span className="order-name">{order.outfitTypeName || order.productName || 'Order'}</span>
                                {/* <span className={`order-status-badge ${order.status}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span> */}
                              </div>
                              <span className="accordion-icon">
                                {expandedOrders[order._id] ? <FiChevronUp /> : <FiChevronDown />}
                              </span>
                            </div>

                            {expandedOrders[order._id] && (
                              <div className="order-accordion-content">
                                {/* <h4 className="order-measurements-title">Order Measurements</h4> */}
                                {order.measurement && order.measurement.length > 0 ? (
                                  <div className="measurement-grid">
                                    {order.measurement.map((measurement, index) => (
                                      <div key={index} className="measurement-item">
                                        <div className="form-group">
                                          <label className="form-label">{measurement.fieldLable} ({measurement.unit})</label>
                                          <input
                                            type="text"
                                            className="input-field"
                                            value={measurement.fieldValue === '0' ? '' : measurement.fieldValue}
                                            placeholder={measurement.fieldValue === '0' ? '' : null}
                                            disabled
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="no-measurements-section">
                                    <FiUser className="no-measurements-icon" />
                                    <p className="no-measurements-text">No measurements available for this order</p>
                                  </div>
                                )}

                                {/* {order.addons && order.addons.length > 0 && (
                                  <div className="order-addons-section">
                                    <h4 className="order-addons-title">Order Addons</h4>
                                    <div className="addons-grid">
                                      {order.addons.map((addon, index) => (
                                        <div key={index} className="addon-item">
                                          <label className="measurement-label">{addon.title}</label>
                                          <div className="measurement-value">
                                            <span className="measurement-number">{addon.value || 'Not Selected'}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )} */}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-measurements-section">
                        <FiUser className="no-measurements-icon" />
                        <p className="no-measurements-text">No orders available for this customer</p>
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
