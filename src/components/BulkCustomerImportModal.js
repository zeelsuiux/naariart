import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FiUploadCloud,
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
  FiDownload,
  FiLoader,
  FiUsers,
} from 'react-icons/fi';
import { customerAPI } from '../services/api';
import { storage } from '../utils/storage';
import { triggerInAppNotification } from '../contexts/NotificationContext';

const BulkCustomerImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const isAdmin = storage.isAdmin();

  if (!isOpen) return null;

  // Download sample Excel template
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        fullName: 'Pooja Sharma',
        mobile: '9876543210',
        dob: '1995-04-12',
        reference: 'Instagram',
        address: '102, Saffron Heights, Ring Road, Surat',
        notes: 'Prefers heavy hand embroidery & pastel tones',
      },
      {
        fullName: 'Meera Patel',
        mobile: '9825012345',
        dob: '1992-09-24',
        reference: 'Friend referral (Ananya)',
        address: 'B-404, Royal Orchid, Vesu, Surat',
        notes: 'Bridal wear consultation for November wedding',
      },
      {
        fullName: 'Aarti Desai',
        mobile: '9898011223',
        dob: '1998-11-05',
        reference: 'Walk-in',
        address: 'Ghod Dod Road, Surat',
        notes: 'Reception lehenga trial',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 22 }, // fullName
      { wch: 15 }, // mobile
      { wch: 14 }, // dob
      { wch: 25 }, // reference
      { wch: 35 }, // address
      { wch: 40 }, // notes
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, 'NaariArt_Customer_Bulk_Template.xlsx');
  };

  // Parse uploaded Excel file
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setErrorMsg('');
    setImportResult(null);
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setErrorMsg('The selected Excel file is empty.');
          return;
        }

        // Normalize keys and validate rows
        const normalized = rawJson.map((row, idx) => {
          // Look for matching column variations
          const fullName =
            row.fullName || row['Full Name'] || row['fullname'] || row['Name'] || row['name'] || '';
          const mobile =
            row.mobile ||
            row['Mobile'] ||
            row['Mobile Number'] ||
            row['Phone'] ||
            row['Contact'] ||
            row['phone'] ||
            '';
          const dob =
            row.dob || row['DOB'] || row['Date of Birth'] || row['Birth Date'] || row['birthDate'] || '';
          const reference =
            row.reference || row['Reference'] || row['Referred By'] || row['Source'] || '';
          const address =
            row.address || row['Address'] || row['City'] || row['Location'] || '';
          const notes =
            row.notes || row['Notes'] || row['Remark'] || row['Remarks'] || '';

          const isValid = Boolean(String(fullName).trim() && String(mobile).trim());
          let invalidReason = '';
          if (!String(fullName).trim() && !String(mobile).trim()) {
            invalidReason = 'Missing Full Name & Mobile Number';
          } else if (!String(fullName).trim()) {
            invalidReason = 'Missing Full Name (Mandatory)';
          } else if (!String(mobile).trim()) {
            invalidReason = 'Missing Mobile Number (Mandatory)';
          }

          return {
            rowNum: idx + 2, // header is row 1
            fullName: String(fullName).trim(),
            mobile: String(mobile).trim(),
            dob: String(dob).trim(),
            reference: String(reference).trim(),
            address: String(address).trim(),
            notes: String(notes).trim(),
            isValid,
            invalidReason,
          };
        });

        setParsedRows(normalized);
      } catch (err) {
        console.error('Failed to parse excel:', err);
        setErrorMsg('Could not parse Excel file. Please ensure it is a valid .xlsx or .xls document.');
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  // Perform bulk import
  const handleStartImport = async () => {
    if (!isAdmin) {
      setErrorMsg('Unauthorized: Only Master Admin can bulk import customers.');
      return;
    }

    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMsg('No valid customer rows found to import.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setImportProgress({ current: 0, total: validRows.length });

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        const payload = {
          fullName: row.fullName,
          mobile: row.mobile,
          dob: row.dob || '',
          reference: row.reference || '',
          address: row.address || '',
          notes: row.notes || '',
          profile_pic: '',
        };

        await customerAPI.saveCustomer(payload);
        successCount++;
      } catch (err) {
        console.error(`Error importing row ${row.rowNum}:`, err);
        failCount++;
        errors.push(`Row ${row.rowNum} (${row.fullName}): ${err.message || 'API error'}`);
      }

      setImportProgress({ current: i + 1, total: validRows.length });
    }

    setIsProcessing(false);
    setImportResult({
      successCount,
      failCount,
      errors,
    });

    triggerInAppNotification(
      'Bulk Customer Import Completed',
      `Successfully imported ${successCount} customers into database (${failCount} errors).`,
      successCount > 0 ? 'success' : 'error'
    );

    if (onSuccess && successCount > 0) {
      onSuccess();
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="mm-command-overlay" onClick={onClose}>
      <div className="bulk-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="export-modal-header">
          <div className="export-header-info">
            <div className="export-icon-badge">
              <FiUsers size={20} />
            </div>
            <div>
              <h3 className="export-title">Bulk Customer Excel Import</h3>
              <p className="export-subtitle">Add multiple customers to atelier database at once</p>
            </div>
          </div>
          <button type="button" className="export-close-btn" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="export-modal-body">
          {/* Instructions and Download Template */}
          <div className="bulk-template-card">
            <div className="bulk-template-info">
              <span className="bulk-template-title">Excel File Format Requirements</span>
              <p className="bulk-template-desc">
                <strong>Full Name</strong> and <strong>Mobile Number</strong> are mandatory fields.
                Optional fields: <em>Date of Birth</em>, <em>Reference</em>, <em>Address</em>, and <em>Notes</em>.
              </p>
            </div>
            <button
              type="button"
              className="bulk-template-btn"
              onClick={handleDownloadTemplate}
              title="Download pre-formatted Excel template"
            >
              <FiDownload size={14} />
              <span>Download Sample Template</span>
            </button>
          </div>

          {/* Upload Drop Zone */}
          {!importResult && (
            <div
              className="bulk-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <FiUploadCloud size={36} className="bulk-dropzone-icon" />
              <div className="bulk-dropzone-text">
                <span className="bulk-dropzone-title">
                  {file ? file.name : 'Click or drag Excel sheet (.xlsx, .xls) here'}
                </span>
                <span className="bulk-dropzone-sub">
                  Supports up to 500 customers per batch upload
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="export-error-notice">
              <FiAlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 && !importResult && (
            <div className="bulk-preview-section">
              <div className="bulk-preview-summary">
                <span className="bulk-summary-chip valid">
                  <FiCheckCircle size={13} /> {validCount} Ready to Import
                </span>
                {invalidCount > 0 && (
                  <span className="bulk-summary-chip invalid">
                    <FiAlertTriangle size={13} /> {invalidCount} Invalid Rows (Missing Name/Phone)
                  </span>
                )}
              </div>

              <div className="bulk-table-wrap">
                <table className="bulk-preview-table">
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Full Name *</th>
                      <th>Mobile Number *</th>
                      <th>DOB</th>
                      <th>Reference</th>
                      <th>Address</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 10).map((row) => (
                      <tr key={row.rowNum} className={row.isValid ? '' : 'row-error'}>
                        <td>#{row.rowNum}</td>
                        <td className="font-semibold">{row.fullName || '—'}</td>
                        <td>{row.mobile || '—'}</td>
                        <td>{row.dob || '—'}</td>
                        <td>{row.reference || '—'}</td>
                        <td className="text-truncate-cell">{row.address || '—'}</td>
                        <td>
                          {row.isValid ? (
                            <span className="bulk-pill valid">Ready</span>
                          ) : (
                            <span className="bulk-pill error" title={row.invalidReason}>
                              {row.invalidReason}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <div className="bulk-table-more">
                  ...and {parsedRows.length - 10} more rows
                </div>
              )}
            </div>
          )}

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="bulk-progress-box">
              <div className="bulk-progress-label">
                <span>Importing customers to database...</span>
                <span>
                  {importProgress.current} / {importProgress.total}
                </span>
              </div>
              <div className="bulk-progress-bar-bg">
                <div
                  className="bulk-progress-bar-fill"
                  style={{
                    width: `${(importProgress.current / (importProgress.total || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Import Result Summary */}
          {importResult && (
            <div className="bulk-result-card">
              <div className="bulk-result-icon-circle">
                <FiCheckCircle size={32} />
              </div>
              <h4 className="bulk-result-title">Import Finished</h4>
              <p className="bulk-result-subtitle">
                Successfully registered <strong>{importResult.successCount}</strong> customers into the atelier system.
                {importResult.failCount > 0 && ` (${importResult.failCount} failed)`}
              </p>

              {importResult.errors.length > 0 && (
                <div className="bulk-error-list">
                  <div className="bulk-error-header">Failure Details:</div>
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="bulk-error-item">{err}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="export-modal-footer">
          <button
            type="button"
            className="export-cancel-btn"
            onClick={onClose}
            disabled={isProcessing}
          >
            {importResult ? 'Done' : 'Cancel'}
          </button>

          {!importResult && (
            <button
              type="button"
              className="export-submit-btn"
              onClick={handleStartImport}
              disabled={isProcessing || validCount === 0 || !isAdmin}
            >
              {isProcessing ? (
                <>
                  <FiLoader className="spin" size={16} />
                  <span>Importing ({importProgress.current}/{importProgress.total})...</span>
                </>
              ) : (
                <>
                  <FiUploadCloud size={16} />
                  <span>Import {validCount} Customers</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkCustomerImportModal;
