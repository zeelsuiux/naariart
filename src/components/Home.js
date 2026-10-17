import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiStar, FiHeart, FiScissors, FiShield } from 'react-icons/fi';
import PublicLayout from './PublicLayout';
import logoImg from '../assets/naari-logo.png';

const Home = () => (
  <PublicLayout>
    {/* Hero Section */}
    <section className="public-hero">
      <div className="hero-text-col">
        <div className="hero-badge">
          <FiStar /> Crafted For Your Sacred Occasions
        </div>
        <h1 className="hero-title">
          Clothing with a <span className="title-accent">story</span> of its own.
        </h1>
        <p className="public-lede">
          Discover thoughtful silhouettes, handcrafted zardozi and thread embroidery, and the quiet luxury of bespoke Indian ethnic couture tailored exclusively for you.
        </p>
        <div className="public-actions">
          <Link className="public-button primary" to="/product">
            Explore Collection <FiArrowRight />
          </Link>
          <Link className="public-button secondary" to="/contact">
            Book Atelier Appointment
          </Link>
        </div>

        {/* Hero Features List */}
        <div className="hero-perks">
          <span><FiCheckCircle /> 100% Custom Fit</span>
          <span><FiCheckCircle /> Handcrafted Embroidery</span>
          <span><FiCheckCircle /> Pure Handpicked Fabrics</span>
        </div>
      </div>

      <div className="hero-visual-col">
        <div className="hero-visual-card">
          <div className="hero-visual-glow" />
          <div className="hero-visual-inner">
            <div className="hero-brand-emblem">
              <img src={logoImg} alt="Naari Art" className="hero-emblem-img" />
            </div>
            <div className="hero-card-meta">
              <span className="hero-card-tag">Atelier Naari Art</span>
              <h3>Bespoke Craftsmanship</h3>
              <p>Every seam, motif, and drape is curated with patience and grace in our Surat studio.</p>
            </div>
            <div className="hero-card-footer">
              <div className="hero-stat">
                <strong>10+</strong>
                <span>Artisan Crafts</span>
              </div>
              <div className="hero-stat">
                <strong>100%</strong>
                <span>Made to Measure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Trust & Highlights Ribbon */}
    <section className="highlights-ribbon">
      <div className="highlights-inner">
        <div className="highlight-item">
          <FiScissors className="highlight-icon" />
          <div>
            <h4>Bespoke Tailoring</h4>
            <p>Precise measurements for an effortless, flattering fit</p>
          </div>
        </div>
        <div className="highlight-item">
          <FiStar className="highlight-icon" />
          <div>
            <h4>Artisanal Embroidery</h4>
            <p>Zari, thread, and sequin work crafted by master artisans</p>
          </div>
        </div>
        <div className="highlight-item">
          <FiShield className="highlight-icon" />
          <div>
            <h4>Curated Pure Fabrics</h4>
            <p>Silk, georgette, organza & velvet of superior quality</p>
          </div>
        </div>
        <div className="highlight-item">
          <FiHeart className="highlight-icon" />
          <div>
            <h4>Personal Consultation</h4>
            <p>One-on-one styling guidance for every bride & bridesmaid</p>
          </div>
        </div>
      </div>
    </section>

    {/* Philosophy Section */}
    <section className="philosophy-section">
      <div className="section-head">
        <p className="public-eyebrow">The Naari Art Philosophy</p>
        <h2 className="section-title">Designed with reverence, tailored with love.</h2>
        <p className="section-subtitle">
          We believe high-fashion ethnic clothing should celebrate movement, heritage, and the individuality of the woman wearing it.
        </p>
      </div>

      <div className="public-feature-row">
        <div className="feature-card">
          <div className="feature-num">01</div>
          <h3>Considered Design</h3>
          <p>Distinctive silhouettes shaped around your comfort, personal aesthetic, and the significance of your celebration.</p>
        </div>
        <div className="feature-card">
          <div className="feature-num">02</div>
          <h3>Made with Patience</h3>
          <p>Every finish is given the time and focus it commands — from initial silhouette sketch to hand embroidery and final fitting.</p>
        </div>
        <div className="feature-card">
          <div className="feature-num">03</div>
          <h3>Made For You</h3>
          <p>No cookie-cutter templates. Your ensemble is customized down to every centimeter, fabric shade, and border finish.</p>
        </div>
      </div>
    </section>

    {/* Atelier Process Section */}
    <section className="process-section">
      <div className="section-head">
        <p className="public-eyebrow">The Bespoke Experience</p>
        <h2 className="section-title">How your dream piece comes alive</h2>
      </div>

      <div className="process-grid">
        <div className="process-step">
          <span className="step-count">Step 1</span>
          <h4>Style Consultation</h4>
          <p>Discuss your vision, event theme, silhouette choices, and color preferences with our master stylists.</p>
        </div>
        <div className="process-step">
          <span className="step-count">Step 2</span>
          <h4>Fabric & Motif Selection</h4>
          <p>Touch and explore luxurious raw silks, chiffons, velvets, and hand embroidery swatch samples.</p>
        </div>
        <div className="process-step">
          <span className="step-count">Step 3</span>
          <h4>Precision Measurement</h4>
          <p>Over 18 anatomical measurement checkpoints recorded to ensure flawless posture and comfort.</p>
        </div>
        <div className="process-step">
          <span className="step-count">Step 4</span>
          <h4>Master Craft & Trial</h4>
          <p>Hand-cut, artisanal stitching, delicate hand embellishments, and a trial fitting before delivery.</p>
        </div>
      </div>
    </section>

    {/* CTA Banner */}
    <section className="cta-banner">
      <div className="cta-inner">
        <p className="public-eyebrow" style={{ color: '#F4C7B7' }}>Visit Our Surat Atelier</p>
        <h2>Ready to curate your timeless ensemble?</h2>
        <p>Book a personalized appointment at our studio or submit a custom inquiry online.</p>
        <div className="cta-actions">
          <Link className="public-button primary" to="/contact">
            Book An Appointment <FiArrowRight />
          </Link>
          <Link className="public-button outline" to="/product">
            View Available Designs
          </Link>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default Home;
