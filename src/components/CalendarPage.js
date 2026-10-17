import React, { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { orderAPI, expenseAlertAPI } from '../services/api';
import { storage } from '../utils/storage';
import '../styles.css';
import {
  FiCalendar,
  FiShoppingBag,
  FiTruck,
  FiAlertCircle,
  FiX,
  FiEye,
  FiPhone,
  FiFilter,
} from 'react-icons/fi';

const CalendarPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'deliveries', 'orders', 'alerts'

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const [ordersData, alertsData] = await Promise.all([
        orderAPI.getOrders(),
        expenseAlertAPI.getExpenseAlerts(),
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const formatDateValue = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  };

  const formatDisplayDate = (value) => {
    if (!value) return 'No date';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const events = useMemo(() => {
    const eventList = [];

    const orderLabel = (order) => order.orderId || order.orderName || 'Order';

    orders.forEach((order) => {
      const createdDate = formatDateValue(order.createdAt);
      if (createdDate && (activeFilter === 'all' || activeFilter === 'orders')) {
        eventList.push({
          id: `${order._id || order.id}-created`,
          title: `📦 Order: ${orderLabel(order)}`,
          start: createdDate,
          allDay: true,
          backgroundColor: '#2563EB', // Royal Blue
          borderColor: '#1D4ED8',
          textColor: '#FFFFFF',
          extendedProps: {
            type: 'orderCreated',
            customerName: order.customerId?.fullName || order.customerName || 'Customer',
            customerMobile: order.customerId?.mobile || '',
            orderId: order.orderId || order._id,
            rawOrder: order,
          },
        });
      }

      const deliveryDate = formatDateValue(order.deliveryDate);
      if (deliveryDate && (activeFilter === 'all' || activeFilter === 'deliveries')) {
        eventList.push({
          id: `${order._id || order.id}-delivery`,
          title: `🚚 Delivery: ${orderLabel(order)}`,
          start: deliveryDate,
          allDay: true,
          backgroundColor: '#B84F2A', // Naari Terracotta Orange
          borderColor: '#9E3F1F',
          textColor: '#FFFFFF',
          extendedProps: {
            type: 'delivery',
            customerName: order.customerId?.fullName || order.customerName || 'Customer',
            customerMobile: order.customerId?.mobile || '',
            orderId: order.orderId || order._id,
            rawOrder: order,
          },
        });
      }
    });

    alerts.forEach((alert) => {
      const alertDate = formatDateValue(alert.dueDate || alert.date || alert.createdAt);
      if (alertDate && (activeFilter === 'all' || activeFilter === 'alerts')) {
        eventList.push({
          id: alert._id || alert.id,
          title: `⚠️ Alert: ${alert.title || alert.name || 'Expense Alert'}`,
          start: alertDate,
          allDay: true,
          backgroundColor: '#D97706', // Amber
          borderColor: '#B45309',
          textColor: '#FFFFFF',
          extendedProps: {
            type: 'alert',
            alertData: alert,
          },
        });
      }
    });

    return eventList;
  }, [orders, alerts, activeFilter]);

  const openDateModal = (dateValue) => {
    setSelectedDate(formatDateValue(dateValue));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate('');
  };

  const selectedDeliveries = useMemo(() => {
    if (!selectedDate) return [];
    return orders.filter((order) => formatDateValue(order.deliveryDate) === selectedDate);
  }, [orders, selectedDate]);

  const selectedCreatedOrders = useMemo(() => {
    if (!selectedDate) return [];
    return orders.filter((order) => formatDateValue(order.createdAt) === selectedDate);
  }, [orders, selectedDate]);

  const selectedAlerts = useMemo(() => {
    if (!selectedDate) return [];
    return alerts.filter(
      (alert) => formatDateValue(alert.dueDate || alert.date || alert.createdAt) === selectedDate
    );
  }, [alerts, selectedDate]);

  // Upcoming delivery count (next 7 days)
  const upcomingDeliveryCount = useMemo(() => {
    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);
    return orders.filter((o) => {
      if (!o.deliveryDate) return false;
      const d = new Date(o.deliveryDate);
      return d >= now && d <= next7Days;
    }).length;
  }, [orders]);

  return (
    <div className="mm-app-shell">
      <Sidebar onLogout={handleLogout} activePage="calendar" />

      <main className="mm-main">
        {/* Sticky Modern Topbar */}
        <header className="mm-topbar">
          <div className="mm-topbar-left">
            <div className="mm-breadcrumbs">
              <span className="mm-bc-root">Naari Art</span>
              <span className="mm-bc-sep">/</span>
              <span className="mm-bc-cur">Studio Calendar</span>
            </div>
          </div>
          <div className="mm-topbar-right">
            <div className="mm-studio-badge">
              <span className="mm-studio-dot" />
              <span>Naari Couture Studio</span>
            </div>
          </div>
        </header>

        <div className="mm-content">
          {/* Header Stats & Filter Card */}
          <div className="mm-table-card" style={{ marginBottom: '20px' }}>
            <div className="mm-module-header">
              <div className="mm-header-left">
                <div className="mm-header-icon-badge">
                  <FiCalendar size={20} />
                </div>
                <div className="mm-header-title-group">
                  <div className="mm-header-title-row">
                    <h2>Atelier Schedule & Deadlines</h2>
                    <span className="mm-count-pill">{upcomingDeliveryCount} Deliveries this week</span>
                  </div>
                  <p className="mm-header-subtitle">
                    Track client delivery commitments, production completion dates, and studio milestones
                  </p>
                </div>
              </div>

              {/* Event Filter Chips */}
              <div className="mm-header-right">
                <div className="calendar-filter-bar">
                  <span className="cal-filter-label"><FiFilter size={13} /> Filter:</span>
                  {[
                    { id: 'all', label: 'All Events' },
                    { id: 'deliveries', label: '🚚 Deliveries', color: '#B84F2A' },
                    { id: 'orders', label: '📦 Orders', color: '#2563EB' },
                    { id: 'alerts', label: '⚠️ Alerts', color: '#D97706' },
                  ].map((f) => (
                    <button
                      type="button"
                      key={f.id}
                      className={`cal-filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                      onClick={() => setActiveFilter(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar Canvas */}
            <div style={{ padding: '0 20px 20px 20px' }}>
              {loading ? (
                <div className="mm-table-state">
                  <div className="state-desc">Loading atelier calendar schedule...</div>
                </div>
              ) : (
                <div className="mm-calendar-wrapper">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    height="auto"
                    events={events}
                    selectable={true}
                    dateClick={(info) => openDateModal(info.dateStr)}
                    eventClick={(info) => openDateModal(info.event.startStr)}
                    dayMaxEvents={3}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Date Inspection Modal */}
      {isModalOpen && (
        <div className="mm-command-overlay" onClick={closeModal}>
          <div className="cal-inspect-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cal-inspect-header">
              <div>
                <h3 className="cal-inspect-title">Schedule for {formatDisplayDate(selectedDate)}</h3>
                <span className="cal-inspect-sub">
                  {selectedDeliveries.length} Deliveries &bull; {selectedCreatedOrders.length} New Orders &bull; {selectedAlerts.length} Alerts
                </span>
              </div>
              <button type="button" className="export-close-btn" onClick={closeModal}>
                <FiX size={18} />
              </button>
            </div>

            <div className="cal-inspect-body">
              {/* Deliveries on this date */}
              <div className="cal-section">
                <div className="cal-section-head">
                  <FiTruck className="text-brand" size={16} />
                  <span>Client Deliveries Due ({selectedDeliveries.length})</span>
                </div>
                {selectedDeliveries.length === 0 ? (
                  <p className="cal-empty-text">No deliveries scheduled on this date.</p>
                ) : (
                  <div className="cal-item-list">
                    {selectedDeliveries.map((order) => {
                      const custName =
                        order.customerId?.fullName || order.customerName || 'Client';
                      const custPhone = order.customerId?.mobile || order.customerMobile || '';

                      return (
                        <div key={order._id || order.id} className="cal-item-card delivery">
                          <div className="cal-item-main">
                            <span className="cal-item-id">{order.orderId || 'Order'}</span>
                            <span className="cal-item-title">{custName}</span>
                            {custPhone && (
                              <a
                                href={`tel:${custPhone}`}
                                className="cal-item-phone"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FiPhone size={12} /> {custPhone}
                              </a>
                            )}
                          </div>
                          <div className="cal-item-side">
                            <span className={`status-pill status-${(order.status || 'pending').toLowerCase()}`}>
                              {order.status || 'Pending'}
                            </span>
                            <button
                              type="button"
                              className="mm-table-action-btn"
                              onClick={() => {
                                closeModal();
                                navigate(`/orders/view/${order._id || order.id}`);
                              }}
                              title="View Order Details"
                            >
                              <FiEye size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Orders Created on this date */}
              <div className="cal-section">
                <div className="cal-section-head">
                  <FiShoppingBag color="#2563EB" size={16} />
                  <span>New Orders Booked ({selectedCreatedOrders.length})</span>
                </div>
                {selectedCreatedOrders.length === 0 ? (
                  <p className="cal-empty-text">No new orders were booked on this date.</p>
                ) : (
                  <div className="cal-item-list">
                    {selectedCreatedOrders.map((order) => {
                      const custName =
                        order.customerId?.fullName || order.customerName || 'Client';

                      return (
                        <div key={order._id || order.id} className="cal-item-card order">
                          <div className="cal-item-main">
                            <span className="cal-item-id">{order.orderId || 'Order'}</span>
                            <span className="cal-item-title">{custName}</span>
                            <span className="cal-item-type">{order.orderType || 'Bespoke Couture'}</span>
                          </div>
                          <div className="cal-item-side">
                            <button
                              type="button"
                              className="mm-table-action-btn"
                              onClick={() => {
                                closeModal();
                                navigate(`/orders/view/${order._id || order.id}`);
                              }}
                              title="View Order Details"
                            >
                              <FiEye size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Alerts on this date */}
              {selectedAlerts.length > 0 && (
                <div className="cal-section">
                  <div className="cal-section-head">
                    <FiAlertCircle color="#D97706" size={16} />
                    <span>Expense Alerts ({selectedAlerts.length})</span>
                  </div>
                  <div className="cal-item-list">
                    {selectedAlerts.map((alert) => (
                      <div key={alert._id || alert.id} className="cal-item-card alert">
                        <div className="cal-item-main">
                          <span className="cal-item-id">₹{alert.amount || 0}</span>
                          <span className="cal-item-title">{alert.name || alert.title || 'Alert'}</span>
                          <span className="cal-item-desc">{alert.description || 'No description'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="export-modal-footer">
              <button type="button" className="export-submit-btn" onClick={closeModal}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
