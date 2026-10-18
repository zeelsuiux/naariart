import React, { useState, useEffect } from 'react';
import { PRESET_THEMES, getThemeColor, applyTheme, getThemeRgb } from '../utils/theme';
import { FiCheck, FiRefreshCw, FiSliders, FiFileText } from 'react-icons/fi';

const ThemeSettings = () => {
  const [currentColor, setCurrentColor] = useState(getThemeColor());
  const [customHex, setCustomHex] = useState(getThemeColor());
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail?.hex) {
        setCurrentColor(e.detail.hex);
        setCustomHex(e.detail.hex);
      }
    };
    window.addEventListener('naari-theme-changed', handleThemeChange);
    return () => window.removeEventListener('naari-theme-changed', handleThemeChange);
  }, []);

  const handleSelectPreset = (hex) => {
    setCurrentColor(hex);
    setCustomHex(hex);
    applyTheme(hex);
    showNotice('Theme color updated successfully!');
  };

  const handleCustomColorChange = (e) => {
    const hex = e.target.value;
    setCustomHex(hex);
    setCurrentColor(hex);
    applyTheme(hex);
    showNotice('Custom color applied live!');
  };

  const handleHexInputChange = (e) => {
    const hex = e.target.value;
    setCustomHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setCurrentColor(hex);
      applyTheme(hex);
      showNotice('Theme updated!');
    }
  };

  const handleResetDefault = () => {
    const defaultHex = '#B84F2A';
    setCurrentColor(defaultHex);
    setCustomHex(defaultHex);
    applyTheme(defaultHex);
    showNotice('Theme reset to Default Luxury Couture Orange!');
  };

  const showNotice = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const currentRgb = getThemeRgb();

  return (
    <div className="mm-theme-settings-wrapper" style={{ padding: '8px 0' }}>
      <div className="mm-section-card" style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSliders style={{ color: 'var(--primary-color)' }} /> Software & PDF Theme Customizer
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
              Choose your studio brand hue. Changes immediately reflect across the entire software UI, buttons, badges, navigation, and generated Invoice/Quotation PDFs!
            </p>
          </div>
          <button
            type="button"
            className="mm-btn-secondary"
            onClick={handleResetDefault}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <FiRefreshCw size={13} /> Reset to Default
          </button>
        </div>

        {successMessage && (
          <div style={{ padding: '10px 16px', borderRadius: '8px', background: '#ECFDF5', color: '#065F46', fontSize: '13px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #A7F3D0' }}>
            <FiCheck size={16} /> {successMessage}
          </div>
        )}

        {/* Color Picker & Live Hex Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', background: 'var(--primary-orange-color)', borderRadius: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label htmlFor="colorPickerInput" style={{ fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              Color Picker:
            </label>
            <input
              id="colorPickerInput"
              type="color"
              value={currentColor}
              onChange={handleCustomColorChange}
              style={{
                width: '46px',
                height: '46px',
                padding: '2px',
                borderRadius: '8px',
                border: '2px solid #fff',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>HEX Code:</span>
            <input
              type="text"
              value={customHex}
              onChange={handleHexInputChange}
              placeholder="#B84F2A"
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                fontWeight: '600',
                width: '110px',
                letterSpacing: '0.5px'
              }}
            />
          </div>

          <div style={{ fontSize: '12px', color: '#6B7280', marginLeft: 'auto' }}>
            RGB for PDFs: <strong>[{currentRgb.join(', ')}]</strong>
          </div>
        </div>

        {/* Preset Palettes */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
            Curated Luxury Presets
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {PRESET_THEMES.map((preset) => {
              const isSelected = currentColor.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.hex)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: isSelected ? `2px solid ${preset.hex}` : '1px solid #E5E7EB',
                    background: isSelected ? '#FFFFFF' : '#F9FAFB',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: preset.hex,
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                    }}
                  >
                    {isSelected && <FiCheck />}
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937' }}>{preset.name}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'monospace' }}>{preset.hex}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Preview Elements */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '14px' }}>
            Live Components & PDF Preview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* UI Components Preview */}
            <div style={{ padding: '18px', borderRadius: '10px', border: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px' }}>
                UI Elements Preview
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                <button
                  type="button"
                  style={{
                    background: 'var(--primary-color)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  Primary Button
                </button>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    color: 'var(--primary-color)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--primary-color)',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  Outline Button
                </button>
                <span
                  style={{
                    background: 'var(--primary-orange-color)',
                    color: 'var(--primary-color)',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  Active Badge
                </span>
              </div>
              <div
                style={{
                  background: 'var(--primary-gradient)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Primary Gradient Background
              </div>
            </div>

            {/* PDF Mockup Preview */}
            <div style={{ padding: '18px', borderRadius: '10px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiFileText size={14} /> PDF Invoice Header Mockup
              </div>
              <div style={{ border: '1px dashed #D1D5DB', padding: '14px', borderRadius: '6px', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: currentColor }}>
                    Naari House
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: currentColor }}>
                    INVOICE
                  </span>
                </div>
                <div style={{ height: '2px', background: currentColor, marginBottom: '10px' }} />
                <div style={{ fontSize: '11px', color: '#6B7280', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Invoice No: INV-2026-001</span>
                  <span>Total: ₹ 18,500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
