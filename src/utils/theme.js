// Theme Manager for Naari Art
// Dynamically adjusts CSS root variables and provides RGB for PDF generation

export const PRESET_THEMES = [
  { id: 'orange', name: 'Luxury Couture Orange (Default)', hex: '#B84F2A' },
  { id: 'royal-blue', name: 'Royal Navy Blue', hex: '#1E3A8A' },
  { id: 'emerald', name: 'Emerald Luxe Green', hex: '#047857' },
  { id: 'purple', name: 'Regal Velvet Purple', hex: '#6D28D9' },
  { id: 'rose', name: 'Rose Gold / Crimson', hex: '#BE123C' },
  { id: 'teal', name: 'Regal Teal', hex: '#0F766E' },
  { id: 'terracotta', name: 'Warm Terracotta', hex: '#C2410C' },
  { id: 'charcoal', name: 'Obsidian Slate', hex: '#334155' },
];

export const hexToRgb = (hex) => {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  return [
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255,
  ];
};

export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const adjustBrightness = (hex, percent) => {
  const [r, g, b] = hexToRgb(hex);
  const factor = percent / 100;
  if (factor > 0) {
    // Lighten
    return rgbToHex(
      r + (255 - r) * factor,
      g + (255 - g) * factor,
      b + (255 - b) * factor
    );
  } else {
    // Darken
    return rgbToHex(
      r * (1 + factor),
      g * (1 + factor),
      b * (1 + factor)
    );
  }
};

export const getThemeColor = () => {
  return localStorage.getItem('naari_theme_color') || '#B84F2A';
};

export const getThemeRgb = () => {
  try {
    const saved = localStorage.getItem('naari_theme_rgb');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore
  }
  return hexToRgb(getThemeColor());
};

export const applyTheme = (primaryHex) => {
  if (!primaryHex || !primaryHex.startsWith('#')) {
    primaryHex = '#B84F2A';
  }

  const primaryDark = adjustBrightness(primaryHex, -22);
  const primaryDarkest = adjustBrightness(primaryHex, -38);
  const primaryLighter = adjustBrightness(primaryHex, 18);
  const primaryHover = adjustBrightness(primaryHex, -12);
  const primaryLight = adjustBrightness(primaryHex, 75);
  const primaryDimLight = adjustBrightness(primaryHex, 92);
  const primaryOrangeColor = adjustBrightness(primaryHex, 88);
  const gradientSecond = adjustBrightness(primaryHex, 18);
  const secondaryGradSecond = adjustBrightness(primaryHex, 30);

  // Full software luxury gradient for sidebar
  const sidebarGradient = `linear-gradient(180deg, ${primaryDarkest} 0%, ${primaryHex} 28%, ${primaryLighter} 70%, ${primaryDark} 100%)`;

  const root = document.documentElement;
  if (root) {
    root.style.setProperty('--primary-color', primaryHex);
    root.style.setProperty('--primary-dark', primaryDark);
    root.style.setProperty('--primary-darkest', primaryDarkest);
    root.style.setProperty('--primary-hover', primaryHover);
    root.style.setProperty('--primary-light', primaryLight);
    root.style.setProperty('--primary-dim-light', primaryDimLight);
    root.style.setProperty('--primary-orange-color', primaryOrangeColor);
    root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${primaryHex} 0%, ${gradientSecond} 100%)`);
    root.style.setProperty('--secondary-gradient', `linear-gradient(135deg, ${gradientSecond} 0%, ${secondaryGradSecond} 100%)`);
    root.style.setProperty('--sidebar-bg-gradient', sidebarGradient);

    // Public site theme tokens
    root.style.setProperty('--pub-primary', primaryHex);
    root.style.setProperty('--pub-primary-hover', primaryHover);
    root.style.setProperty('--pub-accent', gradientSecond);
    root.style.setProperty('--pub-peach-light', primaryDimLight);
  }

  // Inject or update global dynamic theme stylesheet
  if (typeof document !== 'undefined') {
    let styleTag = document.getElementById('naari-dynamic-theme-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'naari-dynamic-theme-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      :root {
        --primary-color: ${primaryHex} !important;
        --primary-hover: ${primaryHover} !important;
        --primary-dark: ${primaryDark} !important;
        --primary-darkest: ${primaryDarkest} !important;
        --primary-light: ${primaryLight} !important;
        --primary-dim-light: ${primaryDimLight} !important;
        --primary-orange-color: ${primaryOrangeColor} !important;
        --primary-gradient: linear-gradient(135deg, ${primaryHex} 0%, ${gradientSecond} 100%) !important;
        --secondary-gradient: linear-gradient(135deg, ${gradientSecond} 0%, ${secondaryGradSecond} 100%) !important;
        --sidebar-bg-gradient: ${sidebarGradient} !important;
        --pub-primary: ${primaryHex} !important;
        --pub-primary-hover: ${primaryHover} !important;
        --pub-accent: ${gradientSecond} !important;
        --pub-peach-light: ${primaryDimLight} !important;
      }

      .public-site {
        --pub-primary: ${primaryHex} !important;
        --pub-primary-hover: ${primaryHover} !important;
        --pub-accent: ${gradientSecond} !important;
        --pub-peach-light: ${primaryDimLight} !important;
        --pub-border-focus: ${primaryHex} !important;
        --pub-primary-shadow: ${primaryLight} !important;
        --pub-primary-border: ${primaryLight} !important;
      }

      /* ═══ 1. BUTTONS & CTAs (Both Panels) ═══ */
      .mm-btn-primary,
      .btn-create-primary,
      .login-button,
      .pub-btn-primary,
      .public-site .public-button.primary,
      .public-site .public-enquire-pill,
      .public-site .header-cta,
      .public-site .pub-cta-banner .pub-btn-primary,
      .public-site .contact-submit-btn,
      .public-site .collab-submit-btn,
      .public-site .form-submit-btn,
      .save-btn,
      .btn-primary {
        background: linear-gradient(135deg, ${primaryHex} 0%, ${gradientSecond} 100%) !important;
        border-color: ${primaryHex} !important;
        color: #FFFFFF !important;
        box-shadow: 0 4px 12px ${primaryLight} !important;
      }

      .mm-btn-primary:hover,
      .btn-create-primary:hover,
      .login-button:hover,
      .pub-btn-primary:hover,
      .public-site .public-button.primary:hover,
      .public-site .public-enquire-pill:hover,
      .public-site .header-cta:hover,
      .public-site .contact-submit-btn:hover,
      .public-site .collab-submit-btn:hover,
      .public-site .form-submit-btn:hover,
      .save-btn:hover,
      .btn-primary:hover {
        background: ${primaryHover} !important;
        border-color: ${primaryHover} !important;
        color: #FFFFFF !important;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px ${primaryLight} !important;
      }

      .public-site .public-button.secondary:hover,
      .public-site .public-button.outline:hover,
      .mm-btn-secondary:hover {
        border-color: ${primaryHex} !important;
        color: ${primaryHex} !important;
        background: ${primaryDimLight} !important;
      }

      /* ═══ 2. TABS & NAVIGATION ═══ */
      .tab-button.active,
      .tabs .tab.active,
      .mm-tabs .mm-tab.active,
      .public-site .category-pill.active,
      .public-site .pub-pill.active,
      .public-site .public-nav a.active,
      .public-site .public-mobile-links a.active {
        background: ${primaryHex} !important;
        color: #FFFFFF !important;
        border-color: ${primaryHex} !important;
      }

      .public-site .public-nav a:hover,
      .public-site .public-mobile-links a:hover {
        color: ${primaryHex} !important;
      }

      .public-site .category-pill:hover {
        border-color: ${primaryHex} !important;
        color: ${primaryHex} !important;
      }

      .mm-view-toggle button.active,
      .leads-view-toggle .view-toggle-btn.active {
        background: ${primaryHex} !important;
        color: #FFFFFF !important;
        border-color: ${primaryHex} !important;
      }

      /* ═══ 3. SIDEBAR & BRANDING ═══ */
      .mm-sidebar,
      .sidebar {
        background: ${sidebarGradient} !important;
      }

      .sidebar-link-single.active {
        background: rgba(255, 255, 255, 0.2) !important;
        border-left: 4px solid #FFFFFF !important;
      }

      .sidebar-link-single:hover:not(.active) {
        background: rgba(255, 255, 255, 0.12) !important;
      }

      /* ═══ 4. FOCUS RINGS & INPUTS ═══ */
      input:focus,
      select:focus,
      textarea:focus,
      .form-input:focus,
      .form-textarea:focus,
      .mm-search-bar input:focus,
      .catalog-search input:focus {
        border-color: ${primaryHex} !important;
        box-shadow: 0 0 0 3px ${primaryLight} !important;
        outline: none !important;
      }

      /* ═══ 5. BADGES, CHIPS & HIGHLIGHTS ═══ */
      .mm-count-pill,
      .mm-studio-badge,
      .topbar-shop-badge {
        background: ${primaryOrangeColor} !important;
        color: ${primaryHex} !important;
        border-color: ${primaryLight} !important;
      }

      .mm-studio-dot,
      .topbar-shop-dot {
        background: ${primaryHex} !important;
        box-shadow: 0 0 6px ${primaryHex} !important;
      }

      .mm-header-icon-badge {
        background: ${primaryOrangeColor} !important;
        color: ${primaryHex} !important;
        border: 1px solid ${primaryLight} !important;
      }

      .hero-stat strong,
      .title-accent,
      .public-site .title-accent,
      .public-eyebrow,
      .hero-badge,
      .public-site .hero-badge,
      .step-count,
      .feature-num,
      .price-tag,
      .product-price,
      .public-site .price-row .price {
        color: ${primaryHex} !important;
      }

      .hero-badge,
      .public-site .hero-badge {
        border-color: ${primaryLight} !important;
        background: ${primaryDimLight} !important;
      }

      /* ═══ 6. PAGINATION & TABLES ═══ */
      .pagination button.active,
      .page-item.active .page-link,
      .mm-pagination-btn.active {
        background: ${primaryHex} !important;
        border-color: ${primaryHex} !important;
        color: #FFFFFF !important;
      }

      .mm-table tr:hover td,
      .modern-table tbody tr:hover td {
        background-color: ${primaryDimLight} !important;
      }

      .mm-table-action-btn:hover {
        background: ${primaryHex} !important;
        color: #FFFFFF !important;
      }

      /* ═══ 7. ICONS & CARDS ═══ */
      .highlight-icon,
      .info-icon,
      .contact-icon,
      .public-brand-name {
        color: ${primaryHex} !important;
      }

      .cmd-palette-item.selected,
      .cmd-palette-item:hover {
        background: ${primaryOrangeColor} !important;
        color: ${primaryHex} !important;
      }

      .cmd-palette-item.selected .cmd-item-icon {
        color: ${primaryHex} !important;
      }
    `;
  }

  const rgb = hexToRgb(primaryHex);
  localStorage.setItem('naari_theme_color', primaryHex);
  localStorage.setItem('naari_theme_rgb', JSON.stringify(rgb));

  window.dispatchEvent(new CustomEvent('naari-theme-changed', { detail: { hex: primaryHex, rgb } }));
  return primaryHex;
};

// Auto-run on load
if (typeof window !== 'undefined') {
  const current = getThemeColor();
  applyTheme(current);
}
