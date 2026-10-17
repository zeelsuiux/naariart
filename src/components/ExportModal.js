import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FiDownload,
  FiX,
  FiFileText,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { customerAPI, orderAPI, productAPI, inquiryAPI } from '../services/api';
import { storage } from '../utils/storage';
import { triggerInAppNotification } from '../contexts/NotificationContext';

const ExportModal = ({ isOpen, onClose }) => {
  const [dataset, setDataset] = useState('orders');
  const [dateFilter, setDateFilter] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStats, setExportStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const isAdmin = storage.isAdmin();

  if (!isOpen) return null;

  // Compute filter start and end dates based on preset
  const getDateRange = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (dateFilter === 'today') {
      return { start: todayStart, end: todayEnd };
    }
    if (dateFilter === 'yesterday') {
      const yStart = new Date(todayStart);
      yStart.setDate(yStart.getDate() - 1);
      const yEnd = new Date(todayEnd);
      yEnd.setDate(yEnd.getDate() - 1);
      return { start: yStart, end: yEnd };
    }
    if (dateFilter === 'this_week') {
      const currentDay = now.getDay();
      const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Monday
      const wStart = new Date(now.setDate(diff));
      wStart.setHours(0, 0, 0, 0);
      return { start: wStart, end: todayEnd };
    }
    if (dateFilter === 'this_month') {
      const mStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      return { start: mStart, end: todayEnd };
    }
    if (dateFilter === 'custom') {
      const s = startDate ? new Date(startDate) : new Date(2000, 0, 1);
      const e = endDate ? new Date(endDate) : new Date(2099, 11, 31);
      e.setHours(23, 59, 59, 999);
      return { start: s, end: e };
    }
    return { start: new Date(2000, 0, 1), end: new Date(2099, 11, 31) }; // all_time
  };

  const handleExport = async () => {
    if (!isAdmin) {
      setErrorMsg('Unauthorized: Only Master Admin can export company data.');
      return;
    }

    setIsExporting(true);
    setErrorMsg('');
    setExportStats(null);

    try {
      const { start, end } = getDateRange();
      let rawData = [];
      let formattedRows = [];
      let filenamePrefix = 'NaariArt';

      if (dataset === 'customers') {
        filenamePrefix = 'NaariArt_Customers';
        const res = await customerAPI.getCustomers();
        rawData = Array.isArray(res) ? res : res?.customers || [];

        // Filter by date
        const filtered = rawData.filter((item) => {
          if (dateFilter === 'all_time') return true;
          const dt = new Date(item.created_at || item.createdAt || item.date || item.updated_at || Date.now());
          return dt >= start && dt <= end;
        });

        formattedRows = filtered.map((c, index) => ({
          'Sr No': index + 1,
          'Customer ID': c._id || c.id || c.customerId || `CUST-${index + 1}`,
          'Full Name': c.fullName || c.name || '-',
          'Mobile Number': c.mobile || c.phone || c.contact || '-',
          'Email Address': c.email || '-',
          'Date of Birth': c.dob || c.birthDate || '-',
          'Reference': c.reference || c.referredBy || '-',
          'Address': c.address || '-',
          'Notes': c.notes || c.remark || '-',
          'Created Date': c.created_at ? new Date(c.created_at).toLocaleDateString() : '-',
        }));
      } else if (dataset === 'orders') {
        filenamePrefix = 'NaariArt_Orders';
        const res = await orderAPI.getOrders();
        rawData = Array.isArray(res) ? res : res?.orders || [];

        const filtered = rawData.filter((item) => {
          if (dateFilter === 'all_time') return true;
          const dt = new Date(item.orderDate || item.created_at || item.createdAt || Date.now());
          return dt >= start && dt <= end;
        });

        formattedRows = filtered.map((o, index) => ({
          'Sr No': index + 1,
          'Order Number': o.orderNumber || o.orderNo || o._id || `ORD-${index + 1}`,
          'Customer Name': o.customerName || o.customer?.fullName || '-',
          'Customer Phone': o.customerMobile || o.customerPhone || o.customer?.mobile || '-',
          'Outfit / Product': o.productName || o.outfitName || o.title || '-',
          'Status': o.status || 'Pending',
          'Delivery Date': o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString() : '-',
          'Total Amount (₹)': Number(o.totalAmount || o.grandTotal || o.amount || 0).toLocaleString('en-IN'),
          'Advance Paid (₹)': Number(o.advanceAmount || o.paidAmount || 0).toLocaleString('en-IN'),
          'Pending Balance (₹)': Number((o.totalAmount || 0) - (o.advanceAmount || 0)).toLocaleString('en-IN'),
          'Order Date': o.orderDate || o.created_at ? new Date(o.orderDate || o.created_at).toLocaleDateString() : '-',
        }));
      } else if (dataset === 'leads') {
        filenamePrefix = 'NaariArt_Leads';
        let customLeads = [];
        try {
          const stored = localStorage.getItem('naari_custom_leads');
          if (stored) customLeads = JSON.parse(stored);
        } catch {
          // ignore
        }

        let phpInquiries = [];
        try {
          phpInquiries = await inquiryAPI.getInquiries();
        } catch {
          // fallback
        }

        rawData = [...customLeads, ...phpInquiries];

        const filtered = rawData.filter((item) => {
          if (dateFilter === 'all_time') return true;
          const dt = new Date(item.createdAt || item.created_at || item.date || Date.now());
          return dt >= start && dt <= end;
        });

        formattedRows = filtered.map((l, index) => ({
          'Sr No': index + 1,
          'Lead ID': l.id || `LEAD-${index + 1}`,
          'Lead Name': l.name || l.fullName || '-',
          'Mobile / Contact': l.phone || l.mobile || '-',
          'Email': l.email || '-',
          'Interest / Service': l.interest || l.subject || '-',
          'Stage / Status': l.stage || l.status || 'New',
          'Estimated Budget (₹)': l.budget || '-',
          'Source': l.source || 'Direct Consultation',
          'Notes': l.notes || l.message || '-',
          'Received Date': l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '-',
        }));
      } else if (dataset === 'products') {
        filenamePrefix = 'NaariArt_Products';
        const res = await productAPI.getProducts();
        rawData = Array.isArray(res) ? res : res?.products || [];

        const filtered = rawData.filter((item) => {
          if (dateFilter === 'all_time') return true;
          const dt = new Date(item.created_at || item.createdAt || Date.now());
          return dt >= start && dt <= end;
        });

        formattedRows = filtered.map((p, index) => ({
          'Sr No': index + 1,
          'Item Code / SKU': p.sku || p.code || p._id || `PROD-${index + 1}`,
          'Product Name': p.name || p.title || '-',
          'Category': p.category || p.outfitType || '-',
          'Price (₹)': Number(p.price || p.rate || 0).toLocaleString('en-IN'),
          'Color': p.color || '-',
          'Fabric': p.fabric || '-',
          'Description': p.description || '-',
          'Status': p.status || 'Active',
        }));
      }

      if (formattedRows.length === 0) {
        setErrorMsg('No matching records found for the selected date range.');
        setIsExporting(false);
        return;
      }

      // Generate Excel Workbook using SheetJS
      const worksheet = XLSX.utils.json_to_sheet(formattedRows);

      // Auto size column widths
      const colWidths = Object.keys(formattedRows[0] || {}).map((key) => {
        const maxLen = Math.max(
          key.length,
          ...formattedRows.map((row) => String(row[key] || '').length)
        );
        return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
      });
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, dataset.toUpperCase());

      // Format current timestamp for filename
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `${filenamePrefix}_${dateStr}.xlsx`;

      XLSX.writeFile(workbook, filename);

      setExportStats({ count: formattedRows.length, filename });
      triggerInAppNotification(
        'Export Successful',
        `Exported ${formattedRows.length} ${dataset} to ${filename}`,
        'success'
      );
    } catch (err) {
      console.error('Export error:', err);
      setErrorMsg(err.message || 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mm-command-overlay" onClick={onClose}>
      <div className="export-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="export-modal-header">
          <div className="export-header-info">
            <div className="export-icon-badge">
              <FiDownload size={20} />
            </div>
            <div>
              <h3 className="export-title">Export Atelier Data</h3>
              <p className="export-subtitle">Download records directly to Microsoft Excel (.xlsx)</p>
            </div>
          </div>
          <button type="button" className="export-close-btn" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="export-modal-body">
          {!isAdmin && (
            <div className="export-auth-warning">
              <FiAlertCircle size={18} />
              <span>Restricted Access: Export functionality is reserved solely for Master Admin.</span>
            </div>
          )}

          {/* Dataset Selector */}
          <div className="export-form-group">
            <label className="export-label">
              <FiFileText size={15} /> Select Dataset to Export
            </label>
            <div className="export-dataset-grid">
              {[
                { id: 'orders', label: 'Orders & Sales', desc: 'Client orders, payments & status' },
                { id: 'customers', label: 'Customers Directory', desc: 'Clients, phone & measurements' },
                { id: 'leads', label: 'Leads & Enquiries', desc: 'Prospects, budgets & follow-ups' },
                { id: 'products', label: 'Products & Outfits', desc: 'Catalog, pricing & categories' },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`export-dataset-card ${dataset === item.id ? 'active' : ''}`}
                  onClick={() => setDataset(item.id)}
                >
                  <div className="export-radio-bullet" />
                  <div className="export-dataset-text">
                    <span className="export-dataset-name">{item.label}</span>
                    <span className="export-dataset-desc">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="export-form-group">
            <label className="export-label">
              <FiCalendar size={15} /> Select Time Period / Date Range
            </label>
            <div className="export-preset-chips">
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'this_week', label: 'This Week' },
                { id: 'this_month', label: 'This Month' },
                { id: 'all_time', label: 'All Time' },
                { id: 'custom', label: 'Custom Range' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={`export-chip ${dateFilter === p.id ? 'active' : ''}`}
                  onClick={() => setDateFilter(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Range Inputs */}
            {dateFilter === 'custom' && (
              <div className="export-custom-range-row">
                <div className="export-date-input-col">
                  <span className="export-input-sublabel">Start Date</span>
                  <input
                    type="date"
                    className="export-input-field"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="export-date-input-col">
                  <span className="export-input-sublabel">End Date</span>
                  <input
                    type="date"
                    className="export-input-field"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="export-error-notice">
              <FiAlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {exportStats && (
            <div className="export-success-notice">
              <FiCheckCircle size={16} />
              <span>
                Exported {exportStats.count} records cleanly to <strong>{exportStats.filename}</strong>!
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="export-modal-footer">
          <button type="button" className="export-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="export-submit-btn"
            onClick={handleExport}
            disabled={isExporting || !isAdmin}
          >
            <FiDownload size={16} />
            <span>{isExporting ? 'Generating Excel...' : 'Download Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
