import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles.css';
import { orderAPI } from '../services/api';
import { storage } from '../utils/storage';
import {
  FiShoppingCart,
  FiTruck,
  FiAlertTriangle,
  FiCalendar,
  FiPlus,
  FiSearch,
  FiUserPlus,
  FiPackage,
  FiUserCheck,
  FiChevronDown,
  FiEye,
  FiClock,
} from 'react-icons/fi';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const user = storage.getUser();
  const userName = user?.fullName || user?.name || user?.userName || 'Admin';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeWidget, setActiveWidget] = useState('todayOrders');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading dashboard orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Today reference memoized
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(23, 59, 59, 999);
    return t;
  }, []);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // 1. Today's Orders
  const todayOrders = useMemo(() => {
    return orders.filter((item) => item.createdAt?.slice(0, 10) === todayStr);
  }, [orders, todayStr]);

  // 2. Deliveries Pending
  const deliveries = useMemo(() => {
    return orders.filter((item) => {
      if (!item.deliveryDate) return false;
      const deliveryDate = new Date(item.deliveryDate);
      return (
        deliveryDate <= today &&
        !['completed', 'delivered', 'cancelled'].includes(item.status?.toLowerCase())
      );
    });
  }, [orders, today]);

  // 3. Overdue Deliveries
  const overdue = useMemo(() => {
    return orders.filter((item) => {
      if (!item.deliveryDate) return false;
      const deliveryDate = new Date(item.deliveryDate);
      return (
        deliveryDate < today &&
        !['completed', 'delivered', 'cancelled'].includes(item.status?.toLowerCase())
      );
    });
  }, [orders, today]);

  // 4. Upcoming Deliveries (Next 7 Days)
  const upcomingOrders = useMemo(() => {
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    next7Days.setHours(23, 59, 59, 999);

    return orders.filter((item) => {
      if (!item.deliveryDate) return false;
      const deliveryDate = new Date(item.deliveryDate);
      return (
        deliveryDate >= today &&
        deliveryDate <= next7Days &&
        !['completed', 'delivered', 'cancelled'].includes(item.status?.toLowerCase())
      );
    });
  }, [orders, today]);

  // Filter current active dataset
  const activeOrdersList = useMemo(() => {
    let list = [];
    if (activeWidget === 'todayOrders') list = todayOrders;
    else if (activeWidget === 'deliveries') list = deliveries;
    else if (activeWidget === 'overdue') list = overdue;
    else if (activeWidget === 'upcoming') list = upcomingOrders;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((item) => {
      const orderId = String(item.orderId || '').toLowerCase();
      const customer = String(item.customerId?.fullName || item.customerName || '').toLowerCase();
      const outfit = String(item.outfitTypeName || '').toLowerCase();
      const status = String(item.status || '').toLowerCase();
      return orderId.includes(q) || customer.includes(q) || outfit.includes(q) || status.includes(q);
    });
  }, [activeWidget, todayOrders, deliveries, overdue, upcomingOrders, searchQuery]);

  // Greeting by hour
  const currentHour = new Date().getHours();
  const greetingText =
    currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const formatDisplayDate = (d) => {
    if (!d) return '-';
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? String(d) : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="settings-container mm-app-shell">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="main-content mm-main">
        {/* Modern Topbar Header (My Metaji Style) */}
        <div className="topbar mm-topbar">
          <div className="topbar-left-wrap">
            <nav className="topbar-breadcrumbs" aria-label="Breadcrumb">
              <span className="bc-current">Dashboard</span>
              <span className="bc-sep">/</span>
              <span className="bc-sub">Studio Overview</span>
            </nav>

            <div className="topbar-shop-badge">
              <span className="topbar-shop-dot" />
              <span>Naari Art Studio</span>
            </div>
          </div>

          <div className="topbar-actions-wrap">
            {/* Quick Action Create Dropdown */}
            <div className="topbar-create-wrap">
              <button
                type="button"
                className="btn-create-primary"
                onClick={() => setIsCreateOpen(!isCreateOpen)}
              >
                <span>＋</span>
                <span>Create</span>
                <FiChevronDown size={14} />
              </button>

              {isCreateOpen && (
                <div className="create-dropdown-menu show" onMouseLeave={() => setIsCreateOpen(false)}>
                  <Link to="/orders/add" className="create-dropdown-item" onClick={() => setIsCreateOpen(false)}>
                    <FiShoppingCart size={16} /> New Order
                  </Link>
                  <Link to="/customers/add" className="create-dropdown-item" onClick={() => setIsCreateOpen(false)}>
                    <FiUserPlus size={16} /> Add Customer
                  </Link>
                  <Link to="/products/add" className="create-dropdown-item" onClick={() => setIsCreateOpen(false)}>
                    <FiPackage size={16} /> Add Product
                  </Link>
                  <Link to="/leads" className="create-dropdown-item" onClick={() => setIsCreateOpen(false)}>
                    <FiUserCheck size={16} /> New Lead
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Avatar Pill */}
            <div className="topbar-user-pill">
              <div className="sidebar-avatar sm">{(userName.charAt(0) || 'A').toUpperCase()}</div>
              <span className="topbar-user-name">{userName}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Body Wrapper */}
        <div className="dashboard-page mm-dash-wrapper">
          {/* Welcome Hero Banner (My Metaji Style) */}
          <div className="mm-hero-card">
            <div className="mm-hero-left">
              <div className="mm-hero-badge">
                <span className="mm-hero-dot" />
                <span>Atelier Studio</span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span>
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h1 className="mm-hero-title">
                {greetingText}, {userName} 👋
              </h1>
              <p className="mm-hero-sub">
                <span>{deliveries.length} orders scheduled for delivery</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>Production and atelier active</span>
              </p>
            </div>

            <div className="mm-hero-actions">
              <Link to="/orders/add" className="mm-hero-btn primary">
                <FiPlus size={18} />
                <span>New Order</span>
              </Link>
              <Link to="/customers/add" className="mm-hero-btn secondary">
                <FiUserPlus size={18} />
                <span>Add Customer</span>
              </Link>
            </div>
          </div>

          {/* Action Cards Grid (4 Quick Action Gradient Tiles) */}
          <div className="mm-action-grid">
            <Link to="/orders/add" className="mm-action-card act-order">
              <div className="mm-action-icon">
                <FiShoppingCart size={22} />
              </div>
              <div className="mm-action-details">
                <span className="mm-action-title">Create Order</span>
                <span className="mm-action-desc">Generate bill & measurements</span>
              </div>
            </Link>

            <Link to="/customers/add" className="mm-action-card act-customer">
              <div className="mm-action-icon">
                <FiUserPlus size={22} />
              </div>
              <div className="mm-action-details">
                <span className="mm-action-title">Add Customer</span>
                <span className="mm-action-desc">Register client profile & sizes</span>
              </div>
            </Link>

            <Link to="/products/add" className="mm-action-card act-product">
              <div className="mm-action-icon">
                <FiPackage size={22} />
              </div>
              <div className="mm-action-details">
                <span className="mm-action-title">Add Product</span>
                <span className="mm-action-desc">Catalogue new silhouette</span>
              </div>
            </Link>

            <Link to="/leads" className="mm-action-card act-leads">
              <div className="mm-action-icon">
                <FiUserCheck size={22} />
              </div>
              <div className="mm-action-details">
                <span className="mm-action-title">Sales Leads</span>
                <span className="mm-action-desc">Review website inquiries</span>
              </div>
            </Link>
          </div>

          {/* KPI Cards Row (4 Interactive Stat Cards) */}
          <div className="db-kpi-row">
            <div
              className={`db-kpi orange ${activeWidget === 'todayOrders' ? 'active-kpi' : ''}`}
              onClick={() => setActiveWidget('todayOrders')}
            >
              <div className="db-kpi-icon">
                <FiShoppingCart size={22} />
              </div>
              <div className="db-kpi-details">
                <span className="db-kpi-label">Today's Orders</span>
                <h3 className="db-kpi-val">{todayOrders.length}</h3>
                <span className="db-kpi-sub">Booked today</span>
              </div>
            </div>

            <div
              className={`db-kpi blue ${activeWidget === 'deliveries' ? 'active-kpi' : ''}`}
              onClick={() => setActiveWidget('deliveries')}
            >
              <div className="db-kpi-icon">
                <FiTruck size={22} />
              </div>
              <div className="db-kpi-details">
                <span className="db-kpi-label">Delivery Pending</span>
                <h3 className="db-kpi-val">{deliveries.length}</h3>
                <span className="db-kpi-sub">Due on or before today</span>
              </div>
            </div>

            <div
              className={`db-kpi red ${activeWidget === 'overdue' ? 'active-kpi' : ''}`}
              onClick={() => setActiveWidget('overdue')}
            >
              <div className="db-kpi-icon">
                <FiAlertTriangle size={22} />
              </div>
              <div className="db-kpi-details">
                <span className="db-kpi-label">Overdue Orders</span>
                <h3 className="db-kpi-val">{overdue.length}</h3>
                <span className="db-kpi-sub">Urgent attention needed</span>
              </div>
            </div>

            <div
              className={`db-kpi purple ${activeWidget === 'upcoming' ? 'active-kpi' : ''}`}
              onClick={() => setActiveWidget('upcoming')}
            >
              <div className="db-kpi-icon">
                <FiCalendar size={22} />
              </div>
              <div className="db-kpi-details">
                <span className="db-kpi-label">Upcoming Deliveries</span>
                <h3 className="db-kpi-val">{upcomingOrders.length}</h3>
                <span className="db-kpi-sub">Scheduled next 7 days</span>
              </div>
            </div>
          </div>

          {/* Interactive Orders Table Card (My Metaji Style) */}
          <div className="mm-table-card">
            <div className="mm-table-header">
              <div className="mm-table-header-left">
                <div className="table-title-wrap">
                  <h3 className="mm-table-title">
                    {activeWidget === 'todayOrders' && "Today's Orders"}
                    {activeWidget === 'deliveries' && 'Deliveries Pending'}
                    {activeWidget === 'overdue' && 'Overdue Deliveries'}
                    {activeWidget === 'upcoming' && 'Upcoming Orders (7 Days)'}
                  </h3>
                  <span className="mm-count-badge">{activeOrdersList.length} orders</span>
                </div>

                {/* View Switcher Pills */}
                <div className="mm-table-pills">
                  <button
                    type="button"
                    className={`mm-pill ${activeWidget === 'todayOrders' ? 'active' : ''}`}
                    onClick={() => setActiveWidget('todayOrders')}
                  >
                    Today ({todayOrders.length})
                  </button>
                  <button
                    type="button"
                    className={`mm-pill ${activeWidget === 'deliveries' ? 'active' : ''}`}
                    onClick={() => setActiveWidget('deliveries')}
                  >
                    Pending ({deliveries.length})
                  </button>
                  <button
                    type="button"
                    className={`mm-pill ${activeWidget === 'overdue' ? 'active' : ''}`}
                    onClick={() => setActiveWidget('overdue')}
                  >
                    Overdue ({overdue.length})
                  </button>
                  <button
                    type="button"
                    className={`mm-pill ${activeWidget === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveWidget('upcoming')}
                  >
                    Upcoming ({upcomingOrders.length})
                  </button>
                </div>
              </div>

              {/* Table Search */}
              <div className="mm-table-search">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search orders, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Table Content */}
            <div className="mm-table-wrapper">
              <table className="mm-data-table">
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Customer</th>
                    <th>Outfit Silhouette</th>
                    <th>Delivery Date</th>
                    <th>Status</th>
                    <th>Due Balance</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="mm-table-state">
                        <div className="catalog-spinner" />
                        <p>Loading studio orders...</p>
                      </td>
                    </tr>
                  ) : activeOrdersList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="mm-table-state">
                        <p className="state-title">No orders found in this view</p>
                        <p className="state-desc">
                          {searchQuery
                            ? 'Try clearing your search query.'
                            : 'There are currently no orders under this status category.'}
                        </p>
                        <Link to="/orders/add" className="mm-hero-btn primary sm">
                          <FiPlus /> Create New Order
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    activeOrdersList.map((item) => {
                      const customerName = item.customerId?.fullName || item.customerName || 'Walk-in Client';
                      const initial = (customerName.charAt(0) || 'C').toUpperCase();
                      const dueAmount = Math.max(0, (item.sellingPrice || 0) - (item.advanceAmount || 0));
                      const statusClean = String(item.status || 'Pending').toLowerCase();

                      return (
                        <tr key={item._id}>
                          <td>
                            <Link to={`/orders/view/${item._id}`} className="mm-order-link">
                              #{item.orderId || String(item._id).slice(-6)}
                            </Link>
                          </td>
                          <td>
                            <div className="mm-customer-cell">
                              <span className="customer-avatar-sm">{initial}</span>
                              <span className="customer-name-text">{customerName}</span>
                            </div>
                          </td>
                          <td>
                            <span className="mm-outfit-tag">
                              {item.outfitTypeName || item.outfitStyle || 'Custom Ensemble'}
                            </span>
                          </td>
                          <td>
                            <div className="mm-date-cell">
                              <FiClock size={13} style={{ opacity: 0.6 }} />
                              <span>{formatDisplayDate(item.deliveryDate)}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill status-${statusClean.replace(/[^a-z0-9]+/g, '-')}`}>
                              {item.status || 'Pending'}
                            </span>
                          </td>
                          <td>
                            <strong className="mm-price-text">₹ {dueAmount.toLocaleString('en-IN')}</strong>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Link to={`/orders/view/${item._id}`} className="mm-table-action-btn" title="View Order">
                              <FiEye />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;