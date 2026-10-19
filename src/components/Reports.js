import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles.css';
import { storage } from '../utils/storage';
import { reportsAPI } from '../services/api';
import { FiEye, FiDownload, FiFileText } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = ({ onLogout }) => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('fabric');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return firstDay.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');

    const fetchFabricAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getFabricAnalytics({
                    search: '',
                    startdate: startDate,
                    enddate: endDate,
                });

            setReportData(
                Array.isArray(response) ? response : []
            );
        } catch (err) {
            setError(
                err.message || 'Failed to fetch fabric analytics'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchOutfitAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getOutfitAnalytics({
                    search: '',
                    startdate: startDate,
                    enddate: endDate,
                });

            setReportData(
                Array.isArray(response) ? response : []
            );
        } catch (err) {
            setError(
                err.message || 'Failed to fetch outfit analytics'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchWorktypeAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getWorktypeAnalytics({
                    search: '',
                    startdate: startDate,
                    enddate: endDate,
                });

            setReportData(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(
                err.message || 'Failed to fetch worktype analytics'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkerAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getWorkerAnalytics({
                    search: '',
                    startdate: startDate,
                    enddate: endDate,
                });

            setReportData(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(
                err.message || 'Failed to fetch worker analytics'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getCustomerAnalytics({
                    search: '',
                    startdate: startDate,
                    enddate: endDate,
                });

            setReportData(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(
                err.message || 'Failed to fetch customer analytics'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchDeliveryAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getDeliveryAnalytics({
                    search: '',
                    startdate: startDate,
                    enddate: endDate,
                });

            setReportData(response || {});
        } catch (err) {
            setError(
                err.message || 'Failed to fetch delivery analytics'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        switch (activeTab) {
            case 'fabric':
                fetchFabricAnalytics();
                break;

            case 'outfit':
                fetchOutfitAnalytics();
                break;

            case 'worktype':
                fetchWorktypeAnalytics();
                break;

            case 'worker':
                fetchWorkerAnalytics();
                break;

            case 'customer':
                fetchCustomerAnalytics();
                break;

            case 'delivery':
                fetchDeliveryAnalytics();
                break;

            default:
                break;
        }
    }, [activeTab, startDate, endDate]);

    const handleLogout = () => {
        storage.clearAuthData();
        onLogout();
        navigate('/');
    };

    const [showModal, setShowModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleView = (record) => {
        setSelectedRecord(record);
        setShowModal(true);
    };

    
    const handleDownloadExcel = () => {
        if (!reportData) return;
        let rows = [];

        if (activeTab === 'delivery') {
            rows = [{
                'Total On Time Deliveries': reportData.totalOnTimeDeliveries || 0,
                'Total Delayed Deliveries': reportData.totalDelayedDeliveries || 0,
                'On Time %': (reportData.onTimeDeliveryPercentage || 0) + '%',
                'Delayed %': (reportData.delayedDeliveryPercentage || 0) + '%',
            }];
        } else if (Array.isArray(reportData)) {
            rows = reportData.map((item) => {
                if (activeTab === 'fabric') {
                    return {
                        'Fabric Name': item.fabricName || '-',
                        'Orders': item.noOfOrders || 0,
                        'Revenue (₹)': item.totalRevenue || 0,
                        'Customers': item.noOfCustomers || 0,
                        'Average Revenue (₹)': item.avgRevenue || 0,
                    };
                }
                if (activeTab === 'outfit') {
                    return {
                        'Outfit Name': item.outfitName || '-',
                        'Orders': item.noOfOrders || 0,
                        'Revenue (₹)': item.totalRevenue || 0,
                        'Customers': item.noOfCustomers || 0,
                        'Average Revenue (₹)': item.avgRevenue || 0,
                        'Average Time': item.avgOutfitTime || '-',
                        'Repair Rate': (item.repairPercentage || 0) + '%',
                        'Cancellation Rate': (item.cancelPercentage || 0) + '%',
                    };
                }
                if (activeTab === 'worktype') {
                    return {
                        'Work Type': item.workTypeName || '-',
                        'Orders': item.noOfOrders || 0,
                        'Customers': item.noOfCustomers || 0,
                        'Avg Work Time': item.avgWorkTime || '-',
                    };
                }
                if (activeTab === 'worker') {
                    return {
                        'Worker Name': item.workerName || '-',
                        'Assigned Orders': item.noOfOrders || 0,
                        'Avg Complete Time': item.avgCompleteTime || '-',
                        'Repair Rate': (item.repairPercentage || 0) + '%',
                    };
                }
                if (activeTab === 'customer') {
                    return {
                        'Customer Name': item.customerName || '-',
                        'Orders': item.noOfOrders || 0,
                        'Total Revenue (₹)': item.totalRevenue || 0,
                        'Due Amount (₹)': item.dueAmount || 0,
                        'Avg Revenue / Order (₹)': item.avgRevenue || 0,
                        'Repair Rate': (item.repairPercentage || 0) + '%',
                        'Cancellation Rate': (item.cancelPercentage || 0) + '%',
                    };
                }
                return item;
            });
        }

        if (rows.length === 0) {
            alert('No report data available to export for the selected date range.');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, activeTab.toUpperCase() + '_Report');
        XLSX.writeFile(wb, 'NaariArt_' + activeTab + '_Report_' + startDate + '_to_' + endDate + '.xlsx');
    };

    const handleDownloadPDF = () => {
        if (!reportData) return;
        const doc = new jsPDF('l', 'mm', 'a4');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(184, 79, 42);
        doc.text('Naari Art - Designer Studio', 14, 16);

        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text(activeTab.toUpperCase() + ' ANALYTICS & PRODUCTION REPORT', 14, 23);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('Report Period: ' + startDate + ' to ' + endDate + ' | Generated on: ' + new Date().toLocaleDateString('en-GB'), 14, 29);

        let headers = [];
        let body = [];

        if (activeTab === 'fabric') {
            headers = ['Fabric Name', 'Orders', 'Revenue', 'Customers', 'Avg Revenue'];
            body = (Array.isArray(reportData) ? reportData : []).map(i => [
                i.fabricName, i.noOfOrders, '₹ ' + i.totalRevenue, i.noOfCustomers, '₹ ' + i.avgRevenue
            ]);
        } else if (activeTab === 'outfit') {
            headers = ['Outfit Name', 'Orders', 'Revenue', 'Customers', 'Avg Rev', 'Avg Time', 'Repair %', 'Cancel %'];
            body = (Array.isArray(reportData) ? reportData : []).map(i => [
                i.outfitName, i.noOfOrders, '₹ ' + i.totalRevenue, i.noOfCustomers, '₹ ' + i.avgRevenue, i.avgOutfitTime, (i.repairPercentage || 0) + '%', (i.cancelPercentage || 0) + '%'
            ]);
        } else if (activeTab === 'worktype') {
            headers = ['Work Type', 'Orders', 'Customers', 'Avg Work Time'];
            body = (Array.isArray(reportData) ? reportData : []).map(i => [
                i.workTypeName, i.noOfOrders, i.noOfCustomers, i.avgWorkTime
            ]);
        } else if (activeTab === 'worker') {
            headers = ['Worker Name', 'Assigned Orders', 'Avg Complete Time', 'Repair %'];
            body = (Array.isArray(reportData) ? reportData : []).map(i => [
                i.workerName, i.noOfOrders, i.avgCompleteTime, (i.repairPercentage || 0) + '%'
            ]);
        } else if (activeTab === 'customer') {
            headers = ['Customer Name', 'Orders', 'Revenue', 'Due Amount', 'Avg Rev/Order', 'Repair %', 'Cancel %'];
            body = (Array.isArray(reportData) ? reportData : []).map(i => [
                i.customerName, i.noOfOrders, '₹ ' + i.totalRevenue, '₹ ' + i.dueAmount, '₹ ' + i.avgRevenue, (i.repairPercentage || 0) + '%', (i.cancelPercentage || 0) + '%'
            ]);
        } else if (activeTab === 'delivery') {
            headers = ['Total On-Time Deliveries', 'Total Delayed Deliveries', 'On-Time %', 'Delayed %'];
            body = [[
                reportData.totalOnTimeDeliveries || 0,
                reportData.totalDelayedDeliveries || 0,
                (reportData.onTimeDeliveryPercentage || 0) + '%',
                (reportData.delayedDeliveryPercentage || 0) + '%'
            ]];
        }

        if (body.length === 0) {
            alert('No report data available to export for the selected date range.');
            return;
        }

        doc.autoTable({
            startY: 34,
            head: [headers],
            body: body,
            theme: 'striped',
            headStyles: {
                fillColor: [184, 79, 42],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
            },
            styles: {
                fontSize: 8.5,
                cellPadding: 3,
            },
        });

        doc.save('NaariArt_' + activeTab + '_Report_' + startDate + '_to_' + endDate + '.pdf');
    };

    const closeModal = () => {
        setSelectedRecord(null);
        setShowModal(false);
    };

    return (
        <div className="mm-app-shell">
            <Sidebar onLogout={handleLogout} activePage="reports" />

            <main className="mm-main">
                {/* Sticky Modern Topbar */}
                <header className="mm-topbar">
                    <div className="mm-topbar-left">
                        <div className="mm-breadcrumbs">
                            <span className="mm-bc-root">Naari Art</span>
                            <span className="mm-bc-sep">/</span>
                            <span className="mm-bc-cur">Financial & Production Reports</span>
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
                    {error && (
                        <div className="error-banner" style={{ marginBottom: '20px' }}>
                            {error}
                        </div>
                    )}

                    <div className="mm-table-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ fontWeight: '600', color: '#1E293B', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                Start Date:
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                                />
                            </label>
                            <label style={{ fontWeight: '600', color: '#1E293B', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                End Date:
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                                />
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={handleDownloadExcel}
                                className="mm-btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px', borderRadius: '8px' }}
                                title="Download active report as Excel (.xlsx)"
                            >
                                <FiDownload size={15} /> Download Excel (.xlsx)
                            </button>
                            <button
                                type="button"
                                onClick={handleDownloadPDF}
                                className="mm-btn-secondary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px', borderRadius: '8px' }}
                                title="Download active report as PDF"
                            >
                                <FiFileText size={15} /> Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs reports">
                        <button
                            className={`tab tab-button ${activeTab === 'fabric' ? 'active' : ''
                                }`}
                            onClick={() => setActiveTab('fabric')}
                        >
                            Fabric
                        </button>

                        <button
                            className={`tab tab-button ${activeTab === 'outfit' ? 'active' : ''
                                }`}
                            onClick={() => setActiveTab('outfit')}
                        >
                            Outfit
                        </button>

                        <button
                            className={`tab tab-button ${activeTab === 'worktype' ? 'active' : ''
                                }`}
                            onClick={() => setActiveTab('worktype')}
                        >
                            Work Type
                        </button>

                        <button
                            className={`tab tab-button ${activeTab === 'worker' ? 'active' : ''
                                }`}
                            onClick={() => setActiveTab('worker')}
                        >
                            Worker
                        </button>

                        <button
                            className={`tab tab-button ${activeTab === 'customer' ? 'active' : ''
                                }`}
                            onClick={() => setActiveTab('customer')}
                        >
                            Customer
                        </button>

                        <button
                            className={`tab tab-button ${activeTab === 'delivery' ? 'active' : ''
                                }`}
                            onClick={() => setActiveTab('delivery')}
                        >
                            Delivery
                        </button>
                    </div>

                    <div className="section-header">
                        <h2 className="section-title">
                            {activeTab === 'fabric'
                                ? 'Fabric Analytics'
                                : activeTab === 'outfit'
                                    ? 'Outfit Analytics'
                                    : activeTab === 'worktype'
                                        ? 'Work Type Analytics'
                                        : activeTab === 'worker'
                                            ? 'Worker Analytics'
                                            : activeTab === 'customer'
                                                ? 'Customer Analytics'
                                                : 'Delivery Analytics'}
                        </h2>
                    </div>

                    {loading ? (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '40px',
                            }}
                        >
                            Loading...
                        </div>
                    ) : (
                        activeTab === 'delivery'
                            ? Object.keys(reportData || {}).length > 0
                            : reportData.length > 0
                    ) ? (
                        <div className="table-container">
                            <div className="table-scroll-wrapper">
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                    }}
                                >
                                    <thead>
                                        {activeTab === 'fabric' ? (
                                            <tr>
                                                <th>Fabric Name</th>
                                                <th>Orders</th>
                                                <th>Revenue</th>
                                                <th>Customers</th>
                                                <th>Average Revenue</th>
                                                <th>View</th>
                                            </tr>
                                        ) : activeTab === 'outfit' ? (
                                            <tr>
                                                <th>Outfit Name</th>
                                                <th>Orders</th>
                                                <th>Revenue</th>
                                                <th>Customers</th>
                                                <th>Average Revenue</th>
                                                <th>Average Time</th>
                                                <th>Repairing Rate</th>
                                                <th>Cancellation Rate</th>
                                                <th>View</th>
                                            </tr>
                                        ) : activeTab === 'worktype' ? (
                                            <tr>
                                                <th>Work Type</th>
                                                <th>No. Of Orders</th>
                                                <th>No. Of Customers</th>
                                                <th>Avg Work Time</th>
                                                <th>View</th>
                                            </tr>
                                        ) : activeTab === 'worker' ? (
                                            <tr>
                                                <th>Worker Name</th>
                                                <th>Assigned Orders</th>
                                                <th>Avg Complete Time</th>
                                                <th>Repairing Rate</th>
                                                <th>View</th>
                                            </tr>
                                        ) : activeTab === 'customer' ? (
                                            <tr>
                                                <th>Customer Name</th>
                                                <th>No. Of Orders</th>
                                                <th>Total Revenue</th>
                                                <th>Due Amount</th>
                                                <th>Avg Revenue / Order</th>
                                                <th>Repairing Rate</th>
                                                <th>Cancellation Rate</th>
                                                <th>View</th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th>Total On Time Deliveries</th>
                                                <th>Total Delayed Deliveries</th>
                                                <th>On Time %</th>
                                                <th>Delayed %</th>
                                                <th>View</th>
                                            </tr>
                                        )}
                                    </thead>

                                    {activeTab === 'delivery' ? (
                                        <tbody>
                                            <tr>
                                                <td>{reportData.totalOnTimeDeliveries}</td>
                                                <td>{reportData.totalDelayedDeliveries}</td>
                                                <td>{reportData.onTimeDeliveryPercentage}%</td>
                                                <td>{reportData.delayedDeliveryPercentage}%</td>
                                            </tr>
                                        </tbody>
                                    ) : (
                                        <tbody>
                                            {reportData.map((item, index) => {
                                                if (activeTab === 'fabric') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item.fabricName}</td>
                                                            <td>{item.noOfOrders}</td>
                                                            <td>₹ {item.totalRevenue}</td>
                                                            <td>{item.noOfCustomers}</td>
                                                            <td>₹ {item.avgRevenue}</td>
                                                            <td><button className="edit-btn" title="View" onClick={() => handleView(item)}><FiEye /></button></td>
                                                        </tr>
                                                    );
                                                }

                                                if (activeTab === 'outfit') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item.outfitName}</td>
                                                            <td>{item.noOfOrders}</td>
                                                            <td>₹ {item.totalRevenue}</td>
                                                            <td>{item.noOfCustomers}</td>
                                                            <td>₹ {item.avgRevenue}</td>
                                                            <td>{item.avgOutfitTime}</td>
                                                            <td>
                                                                {item.repairPercentage
                                                                    ? `${item.repairPercentage}%`
                                                                    : '0%'}
                                                            </td>
                                                            <td>{item.cancelPercentage}%</td>
                                                            <td><button className="edit-btn" title="View" onClick={() => handleView(item)}><FiEye /></button></td>
                                                        </tr>
                                                    );
                                                }

                                                if (activeTab === 'worktype') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item.workTypeName}</td>
                                                            <td>{item.noOfOrders}</td>
                                                            <td>{item.noOfCustomers}</td>
                                                            <td>{item.avgWorkTypeTime}</td>
                                                            <td><button className="edit-btn" title="View" onClick={() => handleView(item)}><FiEye /></button></td>
                                                        </tr>
                                                    );
                                                }

                                                if (activeTab === 'worker') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item.workerName}</td>
                                                            <td>{item.noOfAssignedOrders}</td>
                                                            <td>{item.avgTimeToCompleteOrder}</td>
                                                            <td>{item.repairingRatePercentage}</td>
                                                            <td><button className="edit-btn" title="View" onClick={() => handleView(item)}><FiEye /></button></td>
                                                        </tr>
                                                    );
                                                }

                                                if (activeTab === 'customer') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item.customerName}</td>
                                                            <td>{item.noOfOrders}</td>
                                                            <td>₹ {item.totalRevenue}</td>
                                                            <td>₹ {item.totalDueAmount}</td>
                                                            <td>₹ {item.avgRevenuePerOrder}</td>
                                                            <td>{item.repairingRatePercentage}%</td>
                                                            <td>{item.cancelPercentage}%</td>
                                                            <td>
                                                                <button
                                                                    className="edit-btn"
                                                                    title="View"
                                                                    onClick={() => handleView(item)}
                                                                >
                                                                    <FiEye />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                return (
                                                    <tr key={index}>
                                                        <td>{item.deliveryType}</td>
                                                        <td>{item.noOfOrders}</td>
                                                        <td>₹ {item.totalRevenue}</td>
                                                        <td>{item.noOfCustomers}</td>
                                                        <td>₹ {item.avgRevenue}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    )}
                                    {/* <tbody>
                                        {reportData.map((item, index) =>
                                            activeTab === 'fabric' ? (
                                                <tr key={index}>
                                                    <td>{item.fabricName}</td>
                                                    <td>{item.noOfOrders}</td>
                                                    <td>₹ {item.totalRevenue}</td>
                                                    <td>{item.noOfCustomers}</td>
                                                    <td>₹ {item.avgRevenue}</td>
                                                </tr>
                                            ) : (
                                                <tr key={index}>
                                                    <td>{item.outfitName}</td>
                                                    <td>{item.noOfOrders}</td>
                                                    <td>₹ {item.totalRevenue}</td>
                                                    <td>{item.noOfCustomers}</td>
                                                    <td>₹ {item.avgRevenue}</td>
                                                    <td>{item.avgOutfitTime}</td>
                                                    <td>
                                                        {item.repairPercentage
                                                            ? `${item.repairPercentage}%`
                                                            : '0%'}
                                                    </td>
                                                    <td>{item.cancelPercentage}%</td>
                                                </tr>
                                            )
                                        )}
                                    </tbody> */}
                                </table>
                                {showModal && selectedRecord && (
                                    <div className="modal-overlay">
                                        <div
                                            className="modal-content"
                                            style={{
                                                maxWidth: '700px',
                                                width: '90%',
                                            }}
                                        >
                                            <div className="modal-header">
                                                <h3>
                                                    {activeTab === 'fabric'
                                                        ? 'Fabric Details'
                                                        : activeTab === 'outfit'
                                                            ? 'Outfit Details'
                                                            : activeTab === 'worktype'
                                                                ? 'Work Type Details'
                                                                : activeTab === 'worker'
                                                                    ? 'Worker Details'
                                                                    : activeTab === 'customer'
                                                                        ? 'Customer Details'
                                                                        : 'Delivery Details'}
                                                </h3>

                                                <button
                                                    onClick={closeModal}
                                                    style={{
                                                        border: 'none',
                                                        background: 'none',
                                                        fontSize: '20px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="modal-body">
                                                {activeTab === 'fabric' && (
                                                    <>
                                                        <p>
                                                            <strong>Fabric Name:</strong>{' '}
                                                            {selectedRecord.fabricName}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Orders:</strong>{' '}
                                                            {selectedRecord.noOfOrders}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Customers:</strong>{' '}
                                                            {selectedRecord.noOfCustomers}
                                                        </p>

                                                        <p>
                                                            <strong>Total Revenue:</strong> ₹
                                                            {selectedRecord.totalRevenue}
                                                        </p>

                                                        <p>
                                                            <strong>Average Revenue:</strong> ₹
                                                            {selectedRecord.avgRevenue}
                                                        </p>
                                                    </>
                                                )}

                                                {activeTab === 'outfit' && (
                                                    <>
                                                        <p>
                                                            <strong>Outfit Name:</strong>{' '}
                                                            {selectedRecord.outfitName}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Orders:</strong>{' '}
                                                            {selectedRecord.noOfOrders}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Customers:</strong>{' '}
                                                            {selectedRecord.noOfCustomers}
                                                        </p>

                                                        <p>
                                                            <strong>Total Revenue:</strong> ₹
                                                            {selectedRecord.totalRevenue}
                                                        </p>

                                                        <p>
                                                            <strong>Average Revenue:</strong> ₹
                                                            {selectedRecord.avgRevenue}
                                                        </p>

                                                        <p>
                                                            <strong>Average Time:</strong>{' '}
                                                            {selectedRecord.avgOutfitTime}
                                                        </p>

                                                        <p>
                                                            <strong>Repair Rate:</strong>{' '}
                                                            {selectedRecord.repairPercentage}%
                                                        </p>

                                                        <p>
                                                            <strong>Cancel Rate:</strong>{' '}
                                                            {selectedRecord.cancelPercentage}%
                                                        </p>
                                                    </>
                                                )}

                                                {activeTab === 'worktype' && (
                                                    <>
                                                        <p>
                                                            <strong>Work Type:</strong>{' '}
                                                            {selectedRecord.workTypeName}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Orders:</strong>{' '}
                                                            {selectedRecord.noOfOrders}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Customers:</strong>{' '}
                                                            {selectedRecord.noOfCustomers}
                                                        </p>

                                                        <p>
                                                            <strong>Average Work Time:</strong>{' '}
                                                            {selectedRecord.avgWorkTypeTime}
                                                        </p>
                                                    </>
                                                )}

                                                {activeTab === 'worker' && (
                                                    <>
                                                        <p>
                                                            <strong>Worker Name:</strong>{' '}
                                                            {selectedRecord.workerName}
                                                        </p>

                                                        <p>
                                                            <strong>Assigned Orders:</strong>{' '}
                                                            {selectedRecord.noOfAssignedOrders}
                                                        </p>

                                                        <p>
                                                            <strong>Average Complete Time:</strong>{' '}
                                                            {selectedRecord.avgTimeToCompleteOrder}
                                                        </p>

                                                        <p>
                                                            <strong>Repairing Rate:</strong>{' '}
                                                            {selectedRecord.repairingRatePercentage}%
                                                        </p>

                                                        {/* <p>
                                                            <strong>Worker ID:</strong>{' '}
                                                            {selectedRecord.workerId}
                                                        </p> */}
                                                    </>
                                                )}

                                                {activeTab === 'customer' && (
                                                    <>
                                                        <p>
                                                            <strong>Customer Name:</strong>{' '}
                                                            {selectedRecord.customerName}
                                                        </p>

                                                        {/* <p>
                                                            <strong>Customer ID:</strong>{' '}
                                                            {selectedRecord.customerId}
                                                        </p> */}

                                                        <p>
                                                            <strong>No Of Orders:</strong>{' '}
                                                            {selectedRecord.noOfOrders}
                                                        </p>

                                                        <p>
                                                            <strong>Total Revenue:</strong> ₹
                                                            {selectedRecord.totalRevenue}
                                                        </p>

                                                        <p>
                                                            <strong>Total Due Amount:</strong> ₹
                                                            {selectedRecord.totalDueAmount}
                                                        </p>

                                                        <p>
                                                            <strong>Average Revenue Per Order:</strong> ₹
                                                            {selectedRecord.avgRevenuePerOrder}
                                                        </p>

                                                        <p>
                                                            <strong>Repairing Rate:</strong>{' '}
                                                            {selectedRecord.repairingRatePercentage}%
                                                        </p>

                                                        <p>
                                                            <strong>Cancellation Rate:</strong>{' '}
                                                            {selectedRecord.cancelPercentage}%
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    ) : (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '60px',
                                color: 'var(--gray-color)',
                            }}
                        >
                            No Records Found
                        </div>
                    )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Reports;