import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { FiDownload, FiPrinter, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/naari-logo.png';
import { getThemeRgb } from '../utils/theme';
import { getLocalStore, INITIAL_ORDERS, INITIAL_BANK_DETAILS } from '../services/demoStore';
import { openWhatsApp } from '../utils/whatsapp';
import '../styles.css';

const InvoiceView = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const targetId = (orderId || searchParams.get('orderId') || '').trim();
  const [order, setOrder] = useState(null);
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Look up order in demoStore or local storage
    const allOrders = getLocalStore('orders', INITIAL_ORDERS);
    let found = null;
    if (targetId) {
      found = allOrders.find(
        (o) =>
          String(o._id || '').toLowerCase() === targetId.toLowerCase() ||
          String(o.orderId || '').toLowerCase() === targetId.toLowerCase()
      );
    }
    if (!found) {
      found = allOrders[0];
    }

    const banks = getLocalStore('banks', INITIAL_BANK_DETAILS);
    const defaultBank = banks.find((b) => b.isDefault) || banks[0];

    setOrder(found);
    setBank(defaultBank);
    setLoading(false);
  }, [targetId]);

  const customer = order?.customerId || {};
  const customerName = customer?.fullName || customer?.name || 'Valued Client';
  const customerMobile = customer?.mobileNumber || customer?.mobile || customer?.phone || '-';
  const customerAddress = customer?.address || 'Surat, Gujarat';

  const total = Number(order?.sellingPrice || order?.totalPrice || 0);
  const advance = Number(order?.advancePayment || order?.advanceAmount || 0);
  const balanceDue = Math.max(0, total - advance);

  const downloadPDF = () => {
    if (!order) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    const themeRgb = getThemeRgb();

    // Company Header
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...themeRgb);
    doc.setFontSize(22);
    doc.text('Naari Art', 15, 18);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Designer Studio', 15, 24);
    doc.text('24, Ugameshwar Bunglow, Nr Taapi Arcade, Opel Gold', 15, 29);
    doc.text('Mota Varachha, Surat - 394101, Gujarat', 15, 34);
    doc.text('Phone: +91 98250 00000 | Email: contact@naariart.com', 15, 39);

    // Right Header - Tax Invoice
    doc.setTextColor(...themeRgb);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', 195, 18, { align: 'right' });

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${order.orderId || 'INV-001'}`, 195, 26, { align: 'right' });
    doc.text(`Invoice Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB')}`, 195, 31, { align: 'right' });
    doc.text(`Delivery Date: ${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-GB') : 'As scheduled'}`, 195, 36, { align: 'right' });

    doc.setDrawColor(...themeRgb);
    doc.setLineWidth(0.8);
    doc.line(15, 45, 195, 45);

    // Customer Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...themeRgb);
    doc.text('Billed To (Client Details):', 15, 53);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(customerName, 15, 59);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);
    doc.text(`Mobile: ${customerMobile}`, 15, 64);
    doc.text(`Address: ${customerAddress}`, 15, 69);

    // Itemized table
    const rows = [];
    const addRow = (title, price) => {
      const p = Number(price || 0);
      if (p > 0) {
        rows.push([rows.length + 1, title, '1', `₹ ${p.toLocaleString('en-IN')}`, `₹ ${p.toLocaleString('en-IN')}`]);
      }
    };

    addRow('Fabric & Material Purchase', order.fabricPurchasePrice);
    addRow('Dyeing & Color Processing', order.dyeingPrice);
    addRow('Hand Embroidery & Zardozi Work', order.embroideryPrice);
    addRow('Master Tailoring & Stitching', order.stitichingPrice);
    addRow('Latkan, Piping & Hand Finishing', order.otherWorkPrice);
    addRow('Premium Garment Packaging', order.packingPrice);
    addRow('Fusing & Canvas Reinforcement', order.fusingPrice);

    if (rows.length === 0) {
      rows.push(['1', order.productName || 'Custom Couture Outfit', '1', `₹ ${total.toLocaleString('en-IN')}`, `₹ ${total.toLocaleString('en-IN')}`]);
    }

    autoTable(doc, {
      startY: 75,
      head: [['#', 'Description of Service / Garment', 'Qty', 'Unit Rate', 'Amount']],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: themeRgb,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9.5,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3.5,
        textColor: [40, 40, 40],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 95 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'right', cellWidth: 35 },
        4: { halign: 'right', cellWidth: 38 },
      },
    });

    const finalY = doc.lastAutoTable.finalY || 140;

    // Totals Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text('Total Invoice Value:', 125, finalY + 10);
    doc.text(`₹ ${total.toLocaleString('en-IN')}`, 195, finalY + 10, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.text('Advance Received:', 125, finalY + 17);
    doc.text(`₹ ${advance.toLocaleString('en-IN')}`, 195, finalY + 17, { align: 'right' });

    doc.setDrawColor(200, 200, 200);
    doc.line(125, finalY + 20, 195, finalY + 20);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...themeRgb);
    doc.setFontSize(11);
    doc.text('Net Balance Due:', 125, finalY + 27);
    doc.text(`₹ ${balanceDue.toLocaleString('en-IN')}`, 195, finalY + 27, { align: 'right' });

    // Bank Details on Bottom Left
    if (bank) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...themeRgb);
      doc.text('Bank Remittance Details:', 15, finalY + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`Bank: ${bank.bankName}`, 15, finalY + 16);
      doc.text(`A/C Holder: ${bank.accountHolderName || 'Naari Art'}`, 15, finalY + 21);
      doc.text(`A/C No: ${bank.accountNumber}`, 15, finalY + 26);
      doc.text(`IFSC Code: ${bank.ifscCode}`, 15, finalY + 31);
      doc.text(`Branch: ${bank.branchName || 'Surat'}`, 15, finalY + 36);
    }

    // Terms
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Terms & Conditions: Bespoke tailored garments are customized exclusively for the client. Balance is payable upon delivery.', 15, 275);
    doc.text('This is a computer-generated invoice from Naari Art - Designer Studio.', 15, 280);

    doc.save(`NaariArt-Invoice-${order.orderId || 'INV'}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'sans-serif', color: 'var(--primary-color)' }}>
        <h2>Loading Invoice...</h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Order invoice not found.</h2>
        <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="invoice-public-wrapper" style={{ background: '#FAF7F2', minHeight: '100vh', padding: '30px 16px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Action Bar */}
      <div style={{ maxWidth: '820px', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6B635A', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
          <FiArrowLeft size={16} /> Back to Naari Art
        </Link>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={downloadPDF}
            className="mm-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px', borderRadius: '8px' }}
          >
            <FiDownload size={15} /> Download PDF Invoice
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#1E293B', cursor: 'pointer', fontWeight: 600 }}
          >
            <FiPrinter size={15} /> Print
          </button>
          <button
            type="button"
            onClick={() => {
              const url = window.location.href;
              const text = `🧾 *Naari Art - Designer Studio Invoice Receipt*\nView or download your digital invoice here:\n${url}`;
              openWhatsApp(customerMobile, text);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px', borderRadius: '8px', background: '#25D366', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}
            title="Share via WhatsApp"
          >
            <FaWhatsapp size={15} /> WhatsApp
          </button>
        </div>
      </div>

      {/* Main Clean Printable Sheet */}
      <div
        className="invoice-sheet"
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '40px 48px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          border: '1px solid #EAE2D8',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--primary-light, #FFEDD5)', paddingBottom: '24px', marginBottom: '28px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <img src={logo} alt="Naari Art" style={{ height: '42px', width: 'auto' }} />
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--primary-color)' }}>Naari Art</h1>
                <span style={{ fontSize: '12px', color: '#6B635A', letterSpacing: '0.5px' }}>Designer Studio</span>
              </div>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#6B635A', lineHeight: 1.5 }}>
              24, Ugameshwar Bunglow, Nr Taapi Arcade<br />
              Mota Varachha, Surat - 394101, Gujarat<br />
              Phone: +91 98250 00000 | Email: contact@naariart.com
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-block', background: 'var(--primary-color)', color: '#FFFFFF', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>
              TAX INVOICE
            </span>
            <div style={{ fontSize: '13px', color: '#1E1B18', lineHeight: 1.6 }}>
              <div><strong>Invoice / Order:</strong> {order.orderId || 'ORD-001'}</div>
              <div><strong>Date:</strong> {new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB')}</div>
              <div><strong>Delivery:</strong> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-GB') : 'As scheduled'}</div>
            </div>
          </div>
        </div>

        {/* Billed To Row */}
        <div style={{ background: '#FAF7F2', borderRadius: '12px', padding: '18px 24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-color)', letterSpacing: '0.8px' }}>Billed To (Client):</span>
            <h3 style={{ margin: '4px 0 2px', fontSize: '16px', color: '#1E1B18', fontWeight: 700 }}>{customerName}</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B635A' }}>
              Mobile: {customerMobile}<br />
              Address: {customerAddress}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6B635A', letterSpacing: '0.8px' }}>Garment Details:</span>
            <h4 style={{ margin: '4px 0 2px', fontSize: '15px', color: '#1E1B18' }}>{order.productName || order.outfitTypeName || 'Bespoke Couture'}</h4>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#047857', background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
              <FiCheckCircle size={12} /> {order.status || 'Confirmed'}
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '28px' }}>
          <thead>
            <tr style={{ background: 'var(--primary-color)', color: '#FFFFFF' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12.5px', borderRadius: '8px 0 0 8px' }}>Description</th>
              <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12.5px' }}>Qty</th>
              <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12.5px', borderRadius: '0 8px 8px 0' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Fabric & Material Procurement', val: order.fabricPurchasePrice },
              { label: 'Dyeing & Color Formulation', val: order.dyeingPrice },
              { label: 'Handcrafted Embroidery & Zardozi', val: order.embroideryPrice },
              { label: 'Master Artisan Stitching & Tailoring', val: order.stitichingPrice },
              { label: 'Latkan, Borders & Hand Detailing', val: order.otherWorkPrice },
              { label: 'Packaging & Atelier Protective Casing', val: order.packingPrice },
            ]
              .filter((item) => Number(item.val || 0) > 0)
              .map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #EAE2D8' }}>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#1E1B18', fontWeight: 500 }}>{row.label}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '13px', color: '#6B635A' }}>1</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '13px', color: '#1E1B18', fontWeight: 600 }}>
                    ₹ {Number(row.val).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Totals & Bank details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', paddingTop: '12px' }}>
          {/* Bank */}
          {bank && (
            <div style={{ background: '#FAF7F2', padding: '16px 20px', borderRadius: '10px', maxWidth: '340px', fontSize: '12px', color: '#6B635A', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--primary-color)', fontSize: '12.5px', display: 'block', marginBottom: '4px' }}>Bank Transfer Details:</strong>
              <div>Bank: {bank.bankName}</div>
              <div>A/C Holder: {bank.accountHolderName || 'Naari Art'}</div>
              <div>A/C Number: <strong>{bank.accountNumber}</strong></div>
              <div>IFSC Code: <strong>{bank.ifscCode}</strong></div>
              <div>Branch: {bank.branchName || 'Surat'}</div>
            </div>
          )}

          {/* Totals Summary */}
          <div style={{ minWidth: '240px', marginLeft: 'auto', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#6B635A' }}>
              <span>Total Order Value:</span>
              <strong style={{ color: '#1E1B18' }}>₹ {total.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#6B635A' }}>
              <span>Advance Paid:</span>
              <strong style={{ color: '#047857' }}>₹ {advance.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid var(--primary-light, #FFEDD5)', marginTop: '6px', fontSize: '16px' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Balance Payable:</span>
              <strong style={{ color: 'var(--primary-color)', fontWeight: 800 }}>₹ {balanceDue.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px solid #EAE2D8', textAlign: 'center', fontSize: '11.5px', color: '#9B9287' }}>
          Thank you for choosing Naari Art Couture. This is an official digital invoice receipt. For any questions, contact us at +91 98250 00000.
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
