import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../styles.css';
import {
  FiLayout,
  FiShoppingBag,
  FiUser,
  FiUsers,
  FiPackage,
  FiFileText,
  FiCalendar,
  FiMessageSquare,
  FiAlertCircle,
  FiBarChart2,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiUserCheck,
  FiChevronLeft,
  FiChevronRight,
  FiDownloadCloud,
  FiSearch,
} from 'react-icons/fi';
import { storage } from '../utils/storage';
import logoImg from '../assets/naari-logo.png';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMini, setIsMini] = useState(() => localStorage.getItem('naari_sidebar_mini') === 'true');
  const [, setThemeVersion] = useState(0);

  useEffect(() => {
    const onThemeChange = () => setThemeVersion((v) => v + 1);
    window.addEventListener('naari-theme-changed', onThemeChange);
    return () => window.removeEventListener('naari-theme-changed', onThemeChange);
  }, []);

  const toggleMini = () => {
    setIsMini(prev => {
      const next = !prev;
      localStorage.setItem('naari_sidebar_mini', String(next));
      return next;
    });
  };

  const user = storage.getUser();
  const isAdmin = storage.isAdmin();
  const userName = user?.fullName || user?.name || user?.userName || (isAdmin ? 'Admin' : 'Staff');
  const userRole = storage.getUserRole() || (isAdmin ? 'Administrator' : 'Staff Member');
  const userInitial = (userName.charAt(0) || 'N').toUpperCase();

  // Active item resolver
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/customers' || path.startsWith('/customers/')) return 'customers';
    if (path === '/products' || path.startsWith('/products/')) return 'products';
    if (path === '/orders' || path.startsWith('/orders/')) return 'orders';
    if (path === '/team' || path.startsWith('/team/')) return 'team';
    if (path === '/leads' || path.startsWith('/leads/')) return 'leads';
    if (path === '/collaborators' || path.startsWith('/collaborators/')) return 'collaborators';
    if (path === '/tasks' || path.startsWith('/tasks/')) return 'tasks';
    if (path === '/chat' || path.startsWith('/chat/')) return 'chat';
    if (path === '/alert' || path.startsWith('/alert/')) return 'alert';
    if (path === '/reports' || path.startsWith('/reports/')) return 'reports';
    if (path === '/invoice' || path.startsWith('/invoice/')) return 'invoice';
    if (path === '/calendar' || path.startsWith('/calendar/')) return 'calendar';
    if (path === '/settings' || path.startsWith('/settings/')) return 'settings';
    return 'dashboard';
  };

  const activeItem = getActiveItem();

  // Permissions check
  const permissions = JSON.parse(localStorage.getItem('naari_permissions') || '[]');
  const hasPermission = (collectionName) => {
    const p = permissions.find((item) => item.collectionName === collectionName);
    return p?.view === true;
  };

  const canViewSettings = [
    'roles',
    'worktypes',
    'measurements',
    'addons',
    'incometypes',
    'expensetypes',
    'accounting',
    'bankdetails',
    'expensealerts',
  ].some(hasPermission);

  // Grouped Menu Items (My Metaji Style)
  const menuGroups = [
    {
      title: 'Core Menu',
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <FiLayout /> },
        { id: 'orders', label: 'Orders', path: '/orders', icon: <FiShoppingBag />, permission: 'orders' },
        { id: 'customers', label: 'Customers', path: '/customers', icon: <FiUser />, permission: 'customers' },
        { id: 'leads', label: 'Leads & Enquiries', path: '/leads', icon: <FiUserCheck />, visible: isAdmin },
        { id: 'collaborators', label: 'Collaborators', path: '/collaborators', icon: <FiUsers />, visible: isAdmin },
        { id: 'products', label: 'Products & Outfits', path: '/products', icon: <FiPackage />, permission: 'products' },
        { id: 'tasks', label: 'Tasks & Production', path: '/tasks', icon: <FiFileText />, permission: 'task' },
      ],
    },
    {
      title: 'Studio & Operations',
      items: [
        { id: 'team', label: 'Team & Karigars', path: '/team', icon: <FiUsers />, permission: 'staff' },
        { id: 'calendar', label: 'Calendar Schedule', path: '/calendar', icon: <FiCalendar /> },
        { id: 'chat', label: 'Studio Chat', path: '/chat', icon: <FiMessageSquare /> },
        { id: 'alert', label: 'Expense Alerts', path: '/alert', icon: <FiAlertCircle /> },
      ],
    },
    {
      title: 'Finance & Admin',
      items: [
        { id: 'reports', label: 'Reports & Analytics', path: '/reports', icon: <FiBarChart2 /> },
        { id: 'invoice', label: 'Invoices & Bills', path: '/invoice', icon: <FiDollarSign /> },
        { id: 'export', label: 'Export Data (Excel)', icon: <FiDownloadCloud />, isExport: true, visible: isAdmin },
        { id: 'settings', label: 'Atelier Settings', path: '/settings', icon: <FiSettings />, visible: canViewSettings },
      ],
    },
  ];

  const handleNav = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const handleExportClick = () => {
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('naari-open-export'));
  };

  const handleCommandPaletteClick = () => {
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('naari-open-command-palette'));
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const renderNavGroup = (group) => {
    const visibleItems = group.items.filter((item) => {
      if (item.visible !== undefined) return item.visible;
      if (isAdmin) return true;
      if (item.permission) return hasPermission(item.permission);
      return true;
    });

    if (visibleItems.length === 0) return null;

    return (
      <div className="mm-nav-group" key={group.title}>
        <div className="sidebar-section-title">{group.title}</div>
        <div className="mm-nav-list">
          {visibleItems.map((item) => {
            const isActive = activeItem === item.id;
            if (item.isExport) {
              return (
                <button
                  type="button"
                  key={item.id}
                  className="sidebar-link-single export-sidebar-btn"
                  onClick={handleExportClick}
                  title="Export records to Excel (.xlsx)"
                >
                  <span className="sb-icon-wrap">{item.icon}</span>
                  <span className="sb-link-label">{item.label}</span>
                  <span className="sb-tag-pill">Admin</span>
                </button>
              );
            }
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`sidebar-link-single ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.path);
                }}
                title={item.label}
              >
                <span className="sb-icon-wrap">{item.icon}</span>
                <span className="sb-link-label">{item.label}</span>
                {isActive && <span className="sb-active-indicator" />}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Top Bar with Hamburger */}
      <div className="mm-mobile-header" style={{ background: 'var(--primary-gradient)' }}>
        <button
          type="button"
          className="mm-mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <div className="mm-mobile-brand">
          <img src={logoImg} alt="Naari Art" className="mm-mobile-logo" />
          <span>Naari Art</span>
        </div>

        <div className="mm-mobile-user">
          <div className="sidebar-avatar sm">{userInitial}</div>
        </div>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-backdrop show"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Modern Accordion Sidebar with Dynamic Theme Gradient */}
      <aside
        className={`sidebar mm-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isMini ? 'mini' : ''}`}
        style={{ background: 'var(--sidebar-bg-gradient)' }}
      >
        {/* Brand Header */}
        <div className="brand mm-brand">
          <Link to="/dashboard" className="brand-link" onClick={() => setIsMobileMenuOpen(false)}>
            {isMini ? (
              <div className="brand-mini-mark" title="Naari Art Studio">
                NA
              </div>
            ) : (
              <>
                <div className="brand-logo-wrap">
                  <img src={logoImg} alt="Naari Art" className="brand-logo" />
                </div>
                <div className="brand-text-col">
                  <span className="brand-title">Naari Art</span>
                  <span className="brand-tag">Atelier Studio</span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={toggleMini}
            title={isMini ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isMini ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
          </button>
        </div>

        {/* Quick Search (Ctrl + K) Button */}
        <div className="sidebar-quick-search-wrap">
          <button
            type="button"
            className="sidebar-quick-search-btn"
            onClick={handleCommandPaletteClick}
            title="Quick Navigation & Search (Ctrl + K)"
          >
            <FiSearch size={14} className="sb-search-icon" />
            {!isMini && (
              <>
                <span className="sb-search-placeholder">Search or jump to...</span>
                <span className="sb-search-shortcut">Ctrl+K</span>
              </>
            )}
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="sidebar-nav mm-sidebar-nav" id="sidebar-nav">
          {menuGroups.map(renderNavGroup)}
        </nav>

        {/* Sticky User Profile Footer */}
        <div className="sidebar-footer mm-sidebar-footer">
          {!isMini ? (
            <div className="sidebar-user-card" title={userName}>
              <div className="sidebar-avatar">{userInitial}</div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{userName}</span>
                <span className="sidebar-role-pill">{userRole}</span>
              </div>
            </div>
          ) : (
            <div className="sidebar-avatar sm" title={`${userName} (${userRole})`}>
              {userInitial}
            </div>
          )}

          <button
            type="button"
            className="sidebar-logout-icon-btn"
            onClick={handleLogoutClick}
            title="Log Out of System"
          >
            <FiLogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
