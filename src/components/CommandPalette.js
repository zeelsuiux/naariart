import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiLayout,
  FiShoppingBag,
  FiUser,
  FiUserCheck,
  FiPackage,
  FiFileText,
  FiUsers,
  FiCalendar,
  FiMessageSquare,
  FiAlertCircle,
  FiBarChart2,
  FiDollarSign,
  FiSettings,
  FiDownloadCloud,
  FiPlus,
  FiCornerDownLeft,
  FiUpload,
} from 'react-icons/fi';
import { storage } from '../utils/storage';

const CommandPalette = ({ isOpen, onClose, onOpenExport, onOpenBulkImport }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const isAdmin = storage.isAdmin();

  const allItems = [
    // Quick Actions
    {
      id: 'act-new-order',
      title: 'Add New Order',
      subtitle: 'Create a custom tailored order or design',
      category: 'Actions',
      icon: <FiPlus />,
      badge: 'Action',
      action: () => navigate('/orders/add'),
    },
    {
      id: 'act-new-customer',
      title: 'Add New Customer',
      subtitle: 'Register customer measurements and profile',
      category: 'Actions',
      icon: <FiPlus />,
      badge: 'Action',
      action: () => navigate('/customers/add'),
    },
    {
      id: 'act-new-lead',
      title: 'Add New Lead / Enquiry',
      subtitle: 'Log bridal consultation, fitting inquiry or custom lead',
      category: 'Actions',
      icon: <FiPlus />,
      badge: 'Action',
      action: () => navigate('/leads'),
    },
    {
      id: 'act-new-product',
      title: 'Add New Product / Outfit',
      subtitle: 'Upload outfit to catalog with images and pricing',
      category: 'Actions',
      icon: <FiPlus />,
      badge: 'Action',
      action: () => navigate('/products/add'),
    },
    {
      id: 'act-export',
      title: 'Export Data to Excel',
      subtitle: 'Export orders, customers, leads, products to .xlsx',
      category: 'Data & Tools',
      icon: <FiDownloadCloud />,
      badge: 'Admin Only',
      adminOnly: true,
      action: () => {
        if (onOpenExport) onOpenExport();
      },
    },
    {
      id: 'act-bulk-customer',
      title: 'Bulk Customer Import (Excel)',
      subtitle: 'Upload multiple customers at once via Excel sheet',
      category: 'Data & Tools',
      icon: <FiUpload />,
      badge: 'Admin Only',
      adminOnly: true,
      action: () => {
        navigate('/customers');
        if (onOpenBulkImport) setTimeout(onOpenBulkImport, 150);
      },
    },

    // Navigation Pages
    {
      id: 'nav-dashboard',
      title: 'Dashboard Overview',
      subtitle: 'Studio performance, metrics and live orders',
      category: 'Navigation',
      icon: <FiLayout />,
      action: () => navigate('/dashboard'),
    },
    {
      id: 'nav-orders',
      title: 'Orders Management',
      subtitle: 'Track production, payments and deliveries',
      category: 'Navigation',
      icon: <FiShoppingBag />,
      action: () => navigate('/orders'),
    },
    {
      id: 'nav-customers',
      title: 'Customers & Measurements',
      subtitle: 'Client directory, history and measurement profiles',
      category: 'Navigation',
      icon: <FiUser />,
      action: () => navigate('/customers'),
    },
    {
      id: 'nav-leads',
      title: 'Leads & Enquiries (Kanban & Table)',
      subtitle: 'Manage client pipeline, stages and follow-ups',
      category: 'Navigation',
      icon: <FiUserCheck />,
      action: () => navigate('/leads'),
    },
    {
      id: 'nav-products',
      title: 'Products & Outfits Catalog',
      subtitle: 'Bridal wear, couture collections and inventory',
      category: 'Navigation',
      icon: <FiPackage />,
      action: () => navigate('/products'),
    },
    {
      id: 'nav-tasks',
      title: 'Tasks & Production Tracking',
      subtitle: 'Artisan assignments, stitching & finishing steps',
      category: 'Navigation',
      icon: <FiFileText />,
      action: () => navigate('/tasks'),
    },
    {
      id: 'nav-team',
      title: 'Team & Karigars',
      subtitle: 'Artisans, tailors and staff management',
      category: 'Navigation',
      icon: <FiUsers />,
      action: () => navigate('/team'),
    },
    {
      id: 'nav-calendar',
      title: 'Calendar Schedule',
      subtitle: 'Delivery deadlines, trials and consultations',
      category: 'Navigation',
      icon: <FiCalendar />,
      action: () => navigate('/calendar'),
    },
    {
      id: 'nav-chat',
      title: 'Studio Chat',
      subtitle: 'Team communications and production notes',
      category: 'Navigation',
      icon: <FiMessageSquare />,
      action: () => navigate('/chat'),
    },
    {
      id: 'nav-invoice',
      title: 'Invoices & Billing',
      subtitle: 'Print GST invoices, payment receipts and vouchers',
      category: 'Navigation',
      icon: <FiDollarSign />,
      action: () => navigate('/invoice'),
    },
    {
      id: 'nav-reports',
      title: 'Reports & Analytics',
      subtitle: 'Financial insights, order flow and profit reports',
      category: 'Navigation',
      icon: <FiBarChart2 />,
      action: () => navigate('/reports'),
    },
    {
      id: 'nav-alert',
      title: 'Expense Alerts & Limits',
      subtitle: 'Monitor atelier budget and alert thresholds',
      category: 'Navigation',
      icon: <FiAlertCircle />,
      action: () => navigate('/alert'),
    },
    {
      id: 'nav-settings',
      title: 'Atelier Settings',
      subtitle: 'Roles, work types, measurements and bank accounts',
      category: 'Navigation',
      icon: <FiSettings />,
      action: () => navigate('/settings'),
    },
  ];

  // Filter items based on query & permissions
  const filteredItems = allItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mm-command-overlay" onClick={onClose}>
      <div
        className="mm-command-palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="mm-command-header">
          <FiSearch className="mm-command-search-icon" size={18} />
          <input
            ref={inputRef}
            type="text"
            className="mm-command-input"
            placeholder="Type a command, page, action, or search (e.g. Orders, Customer, Export)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className="mm-command-esc-badge" onClick={onClose}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="mm-command-results">
          {filteredItems.length === 0 ? (
            <div className="mm-command-empty">
              <p>No matching commands or pages found for &ldquo;{query}&rdquo;</p>
              <span>Try searching for &quot;Orders&quot;, &quot;Add Customer&quot;, &quot;Export&quot;, or &quot;Leads&quot;</span>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`mm-command-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="mm-command-item-icon">{item.icon}</div>
                  <div className="mm-command-item-content">
                    <div className="mm-command-item-title-row">
                      <span className="mm-command-item-title">{item.title}</span>
                      {item.badge && (
                        <span className="mm-command-item-badge">{item.badge}</span>
                      )}
                    </div>
                    <span className="mm-command-item-sub">{item.subtitle}</span>
                  </div>
                  {isSelected && (
                    <div className="mm-command-item-enter">
                      <FiCornerDownLeft size={13} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="mm-command-footer">
          <div className="mm-cmd-tips">
            <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
            <span><kbd>↵</kbd> to select</span>
            <span><kbd>ESC</kbd> to close</span>
          </div>
          <div className="mm-cmd-brand">Naari Art Quick Nav</div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
