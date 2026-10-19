import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { orderAPI, bankDetailsAPI, legalAPI } from "../services/api";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiPackage, FiDownload, FiPrinter } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Pagination from './Pagination.js';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useReactToPrint } from "react-to-print";
import OrderPrint from "./OrderPrint";
import { getThemeRgb } from '../utils/theme';
import { sendOrderInvoiceViaWhatsApp } from '../utils/whatsapp';


const Order = ({ onLogout }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for filtering
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [bankList, setBankList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedOrder?.orderId || "Order",
  });

  const fetchBanks = async () => {
    try {
      const res = await bankDetailsAPI.getBankDetails();
      setBankList(res || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderAPI.getOrders(); // Fetch all orders without search
      const ordersData = Array.isArray(response) ? response : (response || []);
      setAllOrders(ordersData); // Store all orders
      setOrders(ordersData); // Initially display all orders
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response.data.Message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchBanks();
  }, []);


  // legal pdf generate & invoice API call
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalType, setLegalType] = useState("quotation");

  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [gstPercentage, setGstPercentage] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const handleLegalSubmit = async () => {
    if (!selectedOrder) return;

    try {
      if (legalType === "quotation") {
        generateQuotationPDF(selectedOrder);

        setShowLegalModal(false);
        return;
      }

      if (!gstPercentage) {
        alert("Please select GST Percentage");
        return;
      }

      if (!selectedBank) {
        alert("Please select Bank");
        return;
      }

      console.log(selectedOrder);

      const payload = {
        percentage: Number(gstPercentage),
        amount: Number(invoiceAmount),
        bankdetailsid: selectedBank,
        orderId: selectedOrder._id,
      };

      await legalAPI.saveLegal(payload);

      alert("Invoice created successfully");

      setShowLegalModal(false);
      fetchOrders();

    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    }
  };

  const generateQuotationPDF = (order) => {
    const doc = new jsPDF("p", "mm", "a4");
    const themeRgb = getThemeRgb();

    // ================= HEADER =================

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...themeRgb);
    doc.setFontSize(22);
    doc.text("Naari House", 15, 18);

    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text("24, Ugameshwar Bunglow", 15, 26);
    doc.text("Nr Taapi Arcade", 15, 32);
    doc.text("Nr Opel Gold", 15, 38);
    doc.text("Mota Varachha", 15, 44);
    doc.text("Surat - 394101", 15, 50);

    // ================= RIGHT =================

    doc.setTextColor(...themeRgb);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTATION", 195, 18, { align: "right" });

    doc.setTextColor(0);
    doc.setFontSize(10);

    doc.text(`Quotation No : ${order.orderId}`, 195, 28, {
      align: "right",
    });

    doc.text(
      `Date : ${new Date(order.createdAt).toLocaleDateString("en-GB")}`,
      195,
      34,
      { align: "right" }
    );

    doc.text(
      `Delivery : ${new Date(order.deliveryDate).toLocaleDateString("en-GB")}`,
      195,
      40,
      { align: "right" }
    );

    doc.line(10, 56, 200, 56);

    // ================= CUSTOMER =================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Customer Details", 15, 66);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`Name : ${order.customerId?.fullName}`, 15, 74);
    doc.text(`Mobile : ${order.customerId?.mobile}`, 15, 80);
    doc.text(`Address : ${order.customerId?.address}`, 15, 86);

    // ================= TABLE =================

    const rows = [];

    const addRow = (title, price) => {
      if (Number(price) > 0) {
        rows.push([
          rows.length + 1,
          title,
          1,
          `${price}`,
          `${price}`,
        ]);
      }
    };

    addRow("Fabric Purchase", order.fabricPurchasePrice);
    addRow("Dyeing", order.dyeingPrice);
    addRow("Embroidery", order.embroideryPrice);
    addRow("Stitching", order.stitichingPrice);
    addRow("Other Work", order.otherWorkPrice);
    addRow("Packing", order.packingPrice);
    addRow("Fusing", order.fusingPrice);
    addRow("Khakha", order.khakhaPrice);
    addRow("Art Work", order.artWorkPrice);

    autoTable(doc, {
      startY: 95,
      head: [["#", "Description", "Qty", "Unit Price", "Total"]],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: themeRgb,
        textColor: [255, 255, 255],
        halign: "center",
      },
      styles: {
        fontSize: 10,
        halign: "center",
      },
      columnStyles: {
        1: {
          halign: "left",
        },
      },
    });

    // ================= SUMMARY =================

    const finalY = doc.lastAutoTable.finalY + 10;

    const subTotal = Number(order.totalPrice);
    const sellingPrice = Number(order.sellingPrice);
    const advance = Number(order.advanceAmount);
    const netDue = sellingPrice - advance;

    autoTable(doc, {
      startY: finalY,
      margin: {
        left: 120,
      },
      body: [
        ["Sub Total", `${subTotal}`],
        ["Selling Price", `${sellingPrice}`],
        ["Advance Paid", `${advance}`],
        ["Net Due", `${netDue}`],
      ],
      theme: "grid",
      styles: {
        fontSize: 10,
      },
      columnStyles: {
        0: {
          fontStyle: "bold",
        },
        1: {
          halign: "right",
        },
      },
    });

    // ================= FOOTER =================

    const footerY = doc.lastAutoTable.finalY + 20;

    doc.setFont("helvetica", "italic");
    doc.text(
      `Created By : ${order.createdBy?.fullName}`,
      15,
      285
    );

    doc.save(`Quotation_${order.orderId}.pdf`);
  };

  // local permission get logic start

  const isAdmin = storage.isAdmin();
  const permissions = JSON.parse(localStorage.getItem("naari_permissions")) || [];

  const orderPermission = permissions.find(
    (item) => item.collectionName === "orders" || item.collectionName === "order"
  );

  const canAddEdit = isAdmin || orderPermission?.insertUpdate || true;
  // const canView = isAdmin || orderPermission?.view || true;
  const canDelete = isAdmin || orderPermission?.delete || true;

  // console.log(orderPermission)

  // sorting function
  const handleSort = (key) => {
    let direction = "asc";

    if (
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sortedOrders = [...orders].sort((a, b) => {
      let valueA;
      let valueB;

      switch (key) {
        case "orderId":
          valueA = a.orderId || "";
          valueB = b.orderId || "";
          break;

        case "customer":
          valueA =
            typeof a.customerId === "object"
              ? a.customerId?.fullName || ""
              : a.customerId || "";
          valueB =
            typeof b.customerId === "object"
              ? b.customerId?.fullName || ""
              : b.customerId || "";
          break;

        case "orderType":
          valueA = a.orderType || "";
          valueB = b.orderType || "";
          break;

        case "status":
          valueA = a.status || "";
          valueB = b.status || "";
          break;

        case "createdAt":
          valueA = new Date(a.createdAt || 0);
          valueB = new Date(b.createdAt || 0);
          break;

        case "deliveryDate":
          valueA = new Date(a.deliveryDate || 0);
          valueB = new Date(b.deliveryDate || 0);
          break;

        default:
          return 0;
      }

      if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setOrders(sortedOrders);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "⇅";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const sortedOrders = useMemo(() => {
    let sortableOrders = [...orders];

    if (sortConfig.key) {
      sortableOrders.sort((a, b) => {
        // sorting logic
      });
    }

    return sortableOrders;
  }, [orders, sortConfig]);

  // local permission get logic end

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    // Filter orders locally with universal phone and text search
    if (!query.trim()) {
      setOrders(allOrders); // Show all orders if search is empty
    } else {
      const searchLower = query.toLowerCase();
      const cleanDigits = query.replace(/\D/g, '');
      const filteredOrders = allOrders.filter(order => {
        const custObj = typeof order.customerId === 'object' ? order.customerId : null;
        const custPhone = String(custObj?.mobile || custObj?.phone || order.customerMobile || order.mobile || '');
        const custDigits = custPhone.replace(/\D/g, '');
        const phoneMatch = Boolean(cleanDigits && custDigits.includes(cleanDigits));

        return (
          phoneMatch ||
          (order.orderId && order.orderId.toLowerCase().includes(searchLower)) ||
          (custObj && custObj.fullName && custObj.fullName.toLowerCase().includes(searchLower)) ||
          (order.orderType && order.orderType.toLowerCase().includes(searchLower)) ||
          (order.status && order.status.toLowerCase().includes(searchLower))
        );
      });
      setOrders(filteredOrders);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      setLoading(true);
      await orderAPI.cancelOrder(orderId);
      fetchOrders(); // Refresh orders after deletion
    } catch (err) {
      console.error('Error deleting order:', err);
      alert(err.response.data.Message || 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'pending': { background: '#fef3c7', color: '#92400e' },
      'in-progress': { background: '#dbeafe', color: '#1e40af' },
      'completed': { background: '#d1fae5', color: '#065f46' },
      'cancelled': { background: '#fee2e2', color: '#991b1b' }
    };
    const style = statusStyles[status?.toLowerCase()] || statusStyles['pending'];
    return (
      <span style={{ ...style, padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' }}>
        {status || 'Pending'}
      </span>
    );
  };

  // pagination logic
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;

  const currentOrders = sortedOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const totalPages = Math.ceil(
    orders.length / itemsPerPage
  );

  return (
    <div className="mm-app-shell">
      <Sidebar onLogout={handleLogout} activePage="orders" />

      <main className="mm-main">
        {/* Sticky Modern Topbar */}
        <header className="mm-topbar">
          <div className="mm-topbar-left">
            <div className="mm-breadcrumbs">
              <span className="mm-bc-root">Naari Art</span>
              <span className="mm-bc-sep">/</span>
              <span className="mm-bc-cur">Orders</span>
            </div>
          </div>
          <div className="mm-topbar-right">
            <div className="mm-studio-badge">
              <span className="mm-studio-dot" />
              <span>Naari Couture Studio</span>
            </div>
            {canAddEdit && (
              <button
                type="button"
                className="mm-btn-primary"
                onClick={() => navigate('/orders/add')}
                id="btn-add-new-order"
              >
                <FiPlus size={16} /> + Create Order
              </button>
            )}
          </div>
        </header>

        <div className="mm-content">
          {error && (
            <div className="error-banner" style={{ marginBottom: '20px' }}>
              {error}
              <button onClick={() => setError('')} className="close-error">×</button>
            </div>
          )}

          {/* Modern Table Card */}
          <div className="mm-table-card">
            {/* My Metaji Module Header */}
            <div className="mm-module-header">
              <div className="mm-header-left">
                <div className="mm-header-icon-badge">
                  <FiPackage size={20} />
                </div>
                <div className="mm-header-title-group">
                  <div className="mm-header-title-row">
                    <h2>Orders Management</h2>
                    <span className="mm-count-pill">{orders.length} Orders</span>
                  </div>
                  <p className="mm-header-subtitle">
                    Track bespoke client orders, garment tailoring progress, and delivery schedules
                  </p>
                </div>
              </div>

              <div className="mm-header-right">
                {canAddEdit && (
                  <button
                    type="button"
                    className="mm-btn-primary mm-header-action-btn"
                    onClick={() => navigate('/orders/add')}
                    title="Create Order"
                  >
                    <FiPlus size={15} /> + Create Order
                  </button>
                )}
                <div className="mm-search-bar">
                  <FiSearch className="search-icon" size={14} />
                  <input
                    type="text"
                    placeholder="Search by Order ID, phone..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="mm-table-state">
                <div className="state-desc">Loading client orders...</div>
              </div>
            ) : orders.length > 0 ? (
              <div className="mm-table-wrapper">
                <table className="mm-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '56px' }}>Design</th>
                      <th
                        onClick={() => handleSort("orderId")}
                        className="mm-th-sortable"
                      >
                        Order ID <span className="mm-th-sort-icon">{getSortIcon("orderId")}</span>
                      </th>
                      <th
                        onClick={() => handleSort("createdAt")}
                        className="mm-th-sortable"
                      >
                        Order Date <span className="mm-th-sort-icon">{getSortIcon("createdAt")}</span>
                      </th>
                      <th
                        onClick={() => handleSort("customer")}
                        className="mm-th-sortable"
                      >
                        Customer <span className="mm-th-sort-icon">{getSortIcon("customer")}</span>
                      </th>
                      <th
                        onClick={() => handleSort("orderType")}
                        className="mm-th-sortable"
                      >
                        Order Type <span className="mm-th-sort-icon">{getSortIcon("orderType")}</span>
                      </th>
                      <th
                        onClick={() => handleSort("status")}
                        className="mm-th-sortable"
                      >
                        Status <span className="mm-th-sort-icon">{getSortIcon("status")}</span>
                      </th>
                      <th
                        onClick={() => handleSort("deliveryDate")}
                        className="mm-th-sortable"
                      >
                        Delivery Date <span className="mm-th-sort-icon">{getSortIcon("deliveryDate")}</span>
                      </th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order, index) => {
                      const customerName = typeof order.customerId === 'object' && order.customerId !== null
                        ? (order.customerId.fullName || order.customerId.name || '-')
                        : (order.customerId || '-');

                      return (
                        <tr key={order._id || index}>
                          <td>
                            <div className="mm-prod-thumb">
                              {order.outfitStyleRefImg && order.outfitStyleRefImg.length > 0 ? (
                                <img
                                  src={order.outfitStyleRefImg[0]}
                                  alt={order.orderId || 'Order'}
                                />
                              ) : (
                                <FiPackage size={18} color="#94A3B8" />
                              )}
                            </div>
                          </td>
                          <td>
                            <Link to={`/orders/view/${order._id}`} className="mm-order-link">
                              {order.orderId || '-'}
                            </Link>
                          </td>
                          <td>
                            <span style={{ fontSize: '13px', color: '#64748B' }}>
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : '-'}
                            </span>
                          </td>
                          <td>
                            <div className="mm-customer-cell">
                              <div className="customer-avatar-sm">
                                {customerName !== '-' ? customerName.slice(0, 2).toUpperCase() : '?'}
                              </div>
                              <span className="customer-name-text">{customerName}</span>
                            </div>
                          </td>
                          <td>
                            <span className="mm-outfit-tag">
                              {order.orderType || 'Custom'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill status-${(order.status || 'pending').toLowerCase()}`}>
                              {order.status || 'Pending'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                              {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : '-'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                className="mm-table-action-btn"
                                onClick={() => navigate(`/orders/view/${order._id}`)}
                                title="View Order"
                              >
                                <FiEye size={14} />
                              </button>
                              <button
                                className="mm-table-action-btn"
                                title="Print Order Sheet"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setTimeout(() => {
                                    handlePrint();
                                  }, 100);
                                }}
                              >
                                <FiPrinter size={14} />
                              </button>
                              {canAddEdit && order.status !== 'cancelled' && (
                                <button
                                  className="mm-table-action-btn"
                                  onClick={() => navigate(`/orders/edit/${order._id}`)}
                                  title="Edit Order"
                                >
                                  <FiEdit2 size={14} />
                                </button>
                              )}
                              {canDelete && order.status !== 'cancelled' && (
                                <button
                                  className="mm-table-action-btn"
                                  style={{ color: '#DC2626' }}
                                  onClick={() => handleCancelOrder(order._id)}
                                  title="Delete Order"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              )}
                              {canDelete && order.status !== "cancelled" && (
                                <button
                                  className="mm-table-action-btn"
                                  title="Quotation / Invoice PDF"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setLegalType("quotation");
                                    setGstPercentage("");
                                    setSelectedBank("");
                                    setShowLegalModal(true);
                                  }}
                                >
                                  <FiDownload size={14} />
                                </button>
                              )}
                                <button
                                  className="mm-table-action-btn mm-whatsapp-btn"
                                  title="Send Tax Invoice via WhatsApp"
                                  onClick={() => sendOrderInvoiceViaWhatsApp(order)}
                                  style={{ color: '#25D366' }}
                                >
                                  <FaWhatsapp size={15} />
                                </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mm-table-state">
                <div className="state-title">No orders found</div>
                <div className="state-desc">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Create your first custom tailoring order.'}
                </div>
                {canAddEdit && (
                  <button
                    className="mm-btn-primary"
                    onClick={() => navigate('/orders/add')}
                  >
                    <FiPlus size={15} /> + Create Order
                  </button>
                )}
              </div>
            )}

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
          </div>
        </div>
      </main>
      {showLegalModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Generate Invoice</h2>
            </div>

            <div className="modal-body">

              <div className="mb-3">
                <label>
                  <input
                    type="radio"
                    value="quotation"
                    checked={legalType === "quotation"}
                    onChange={(e) => setLegalType(e.target.value)}
                  />
                  Quotation
                </label>

                {selectedOrder && selectedOrder.legal_created == false ? (
                  <>
                    <label style={{ marginLeft: "20px" }}>
                      <input
                        type="radio"
                        value="invoice"
                        checked={legalType === "invoice"}
                        onChange={(e) => setLegalType(e.target.value)}
                      />
                      Invoice
                    </label>
                  </>
                ) : <div className='theme-color' style={{ marginTop: "12px" }}>Legal document already created for this order. <br /> <Link className='link underline' to={'/invoice'}>Click Here</Link> for show Legal Invoice</div>}

              </div>

              {legalType === "invoice" && (
                <>
                  <div className="form-group" style={{ marginTop: "12px" }}>
                    <label>Amount</label>

                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter Amount"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: "12px" }}>
                    <label>GST Percentage</label>

                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter GST %"
                      value={gstPercentage}
                      onChange={(e) => setGstPercentage(e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: "12px" }}>
                    <label>Bank</label>

                    <select
                      className="form-input"
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      <option value="">Select Bank</option>

                      {bankList.map((bank) => (
                        <option key={bank._id} value={bank._id}>
                          {bank.bankName}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowLegalModal(false)} className="btn btn-cancel">
                Cancel
              </button>

              <button onClick={handleLegalSubmit} className="btn btn-save">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "none" }}>
        <OrderPrint
          ref={printRef}
          order={selectedOrder}
        />
      </div>
    </div>
  );
};

export default Order;
