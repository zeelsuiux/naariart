import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX, FiPhone, FiMapPin, FiMail, FiArrowRight, FiLock, FiStar } from 'react-icons/fi';
import logoImg from '../assets/naari-logo.png';
import '../public.css';

const PublicLayout = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleMobileNav = () => setMobileNavOpen((prev) => !prev);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="public-site">
      {/* Top Announcement Bar */}
      <div className="public-topbar">
        <div className="public-topbar-inner">
          <span className="public-topbar-tag">
            <FiStar /> Haute Couture & Bespoke Atelier
          </span>
          <span className="public-topbar-text">
            Handcrafted Indian Silhouettes & Custom Bridal Stitching in Surat
          </span>
          <div className="public-topbar-contact">
            <a href="tel:+919825000000"><FiPhone /> +91 98250 00000</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="public-header">
        <div className="public-header-inner">
          <Link className="public-brand" to="/" onClick={closeMobileNav}>
            <img src={logoImg} alt="Naari Art" className="public-brand-logo" />
            <div className="public-brand-copy">
              <span className="public-brand-name">Naari Art</span>
              <span className="public-brand-tagline">Elegance of Art</span>
            </div>
          </Link>

          <nav className="public-nav" aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Home
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
              About Us
            </NavLink>
            <NavLink to="/product" className={({ isActive }) => (isActive ? 'active' : '')}>
              Collection
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>
              Atelier & Contact
            </NavLink>
          </nav>

          <div className="public-header-actions">
            <Link className="public-enquire-pill" to="/contact">
              Book Appointment <FiArrowRight />
            </Link>
            <Link className="public-login" to="/login" title="Staff & Admin Portal">
              <FiLock /> Staff Login
            </Link>
            <button
              type="button"
              className="public-mobile-toggle"
              onClick={toggleMobileNav}
              aria-label="Toggle mobile menu"
            >
              {mobileNavOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="public-mobile-drawer" onClick={closeMobileNav}>
            <div className="public-mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
              <div className="public-mobile-drawer-header">
                <div className="public-brand">
                  <img src={logoImg} alt="Naari Art" className="public-brand-logo" />
                  <span className="public-brand-name">Naari Art</span>
                </div>
                <button type="button" className="public-drawer-close" onClick={closeMobileNav}>
                  <FiX size={22} />
                </button>
              </div>

              <div className="public-mobile-links">
                <NavLink to="/" end onClick={closeMobileNav}>Home</NavLink>
                <NavLink to="/about" onClick={closeMobileNav}>About Us</NavLink>
                <NavLink to="/product" onClick={closeMobileNav}>Collection</NavLink>
                <NavLink to="/contact" onClick={closeMobileNav}>Atelier & Contact</NavLink>
              </div>

              <div className="public-mobile-footer">
                <Link className="public-button" to="/contact" onClick={closeMobileNav}>
                  Book Appointment <FiArrowRight />
                </Link>
                <Link className="public-login" to="/login" onClick={closeMobileNav}>
                  <FiLock /> Staff Portal Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Page Body */}
      <main className="public-main">{children}</main>

      {/* Luxury Multi-Column Footer */}
      <footer className="public-footer">
        <div className="public-footer-inner">
          <div className="public-footer-col brand-col">
            <div className="public-footer-brand">
              <img src={logoImg} alt="Naari Art" className="footer-logo" />
              <div>
                <h3>Naari Art</h3>
                <p className="footer-sub">Elegance of Art</p>
              </div>
            </div>
            <p className="footer-about">
              Crafting exquisite Indian ethnic wear, bespoke bridal ensembles, and personalized silhouettes with meticulous hand embroidery and artisanal heritage in Surat.
            </p>
            <div className="footer-badge">
              <FiStar /> 100% Custom Tailored & Handcrafted
            </div>
          </div>

          <div className="public-footer-col">
            <h4 className="footer-title">Explore</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">Our Story & Philosophy</Link></li>
              <li><Link to="/product">The Collection</Link></li>
              <li><Link to="/contact">Book Studio Visit</Link></li>
              <li><Link to="/login">Staff Portal</Link></li>
            </ul>
          </div>

          <div className="public-footer-col">
            <h4 className="footer-title">Atelier Services</h4>
            <ul className="footer-links">
              <li><span>Custom Bridal Lehengas</span></li>
              <li><span>Artisanal Hand Embroidery</span></li>
              <li><span>Designer Kurtis & Tunics</span></li>
              <li><span>Festive Sarees & Drapes</span></li>
              <li><span>Made-to-Measure Tailoring</span></li>
            </ul>
          </div>

          <div className="public-footer-col">
            <h4 className="footer-title">Studio & Contact</h4>
            <div className="footer-contact-item">
              <FiMapPin className="footer-icon" />
              <p>24, Ugameshwar Bungalow, Nr Tapi Arcade, Mota Varachha, Surat - 394101</p>
            </div>
            <div className="footer-contact-item">
              <FiPhone className="footer-icon" />
              <p><a href="tel:+919825000000">+91 98250 00000</a></p>
            </div>
            <div className="footer-contact-item">
              <FiMail className="footer-icon" />
              <p><a href="mailto:hello@naariart.com">hello@naariart.com</a></p>
            </div>
            <p className="footer-hours">
              <strong>Studio Hours:</strong> Mon - Sat: 10:00 AM – 8:00 PM
            </p>
          </div>
        </div>

        <div className="public-footer-bottom">
          <p>© {new Date().getFullYear()} Naari Art. All Rights Reserved.</p>
          <p className="footer-credit">
            Crafted with passion in Surat • Elegance of Art
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
