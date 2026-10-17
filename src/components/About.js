import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiHeart, FiScissors, FiStar, FiUsers } from 'react-icons/fi';
import PublicLayout from './PublicLayout';
import logoImg from '../assets/naari-logo.png';

const About = () => (
  <PublicLayout>
    <section className="about-hero">
      <div className="about-hero-inner">
        <div className="hero-badge">
          <FiStar /> The Naari Art Heritage
        </div>
        <h1 className="about-title">Modern Indian craft, made deeply personal.</h1>
        <p className="public-lede">
          Naari Art was born out of an enduring reverence for traditional Indian textiles and the conviction that true luxury lies in clothing created with patience, precision, and heartfelt care.
        </p>
      </div>
    </section>

    {/* Brand Story Section */}
    <section className="about-story-section">
      <div className="about-story-grid">
        <div className="about-story-text">
          <p className="public-eyebrow">Our Atelier Story</p>
          <h2>Where tradition meets modern grace.</h2>
          <p>
            Based in the textile heartland of Surat, Naari Art bridges centuries-old embroidery techniques with contemporary silhouettes designed for the modern Indian woman.
          </p>
          <p>
            We don’t believe in mass production or hurried trends. Every garment that departs from our studio is individually drafted, cut to measure, and hand-embellished by dedicated karigars who have spent decades perfecting their art.
          </p>
          <div className="about-perks-list">
            <div><FiCheckCircle className="check-icon" /> Over a decade of bridal & couture expertise</div>
            <div><FiCheckCircle className="check-icon" /> In-house hand embroidery, dyeing & custom tailoring</div>
            <div><FiCheckCircle className="check-icon" /> Flawless personalized fitting & styling sessions</div>
          </div>
        </div>

        <div className="about-story-card">
          <div className="story-card-inner">
            <img src={logoImg} alt="Naari Art Atelier" className="story-logo" />
            <h3>Atelier Naari Art</h3>
            <p className="story-quote">
              “A garment is not merely fabric stitched together; it is an intimate expression of joy, heritage, and the memories you create in it.”
            </p>
            <span className="story-author">— The Naari Art Design Team</span>
          </div>
        </div>
      </div>
    </section>

    {/* Values Grid */}
    <section className="about-values-section">
      <div className="section-head">
        <p className="public-eyebrow">The Principles That Guide Us</p>
        <h2 className="section-title">The Four Pillars of Our Craft</h2>
      </div>

      <div className="values-grid">
        <div className="value-card">
          <div className="value-icon-box"><FiScissors /></div>
          <h3>1. Considered Architecture</h3>
          <p>We build our silhouettes around real bodies, ensuring balance, comfortable movement, and confidence throughout your special day.</p>
        </div>

        <div className="value-card">
          <div className="value-icon-box"><FiStar /></div>
          <h3>2. Artisanal Handwork</h3>
          <p>From fine Zardozi and intricate Dabka to delicate Resham florals, each motif is brought to life stitch by painstaking stitch.</p>
        </div>

        <div className="value-card">
          <div className="value-icon-box"><FiHeart /></div>
          <h3>3. Empathetic Listening</h3>
          <p>We listen closely to your vision, your comfort preferences, and the occasion’s essence before creating your personalized piece.</p>
        </div>

        <div className="value-card">
          <div className="value-icon-box"><FiUsers /></div>
          <h3>4. Honoring Our Karigars</h3>
          <p>Our studio empowers traditional Indian textile artisans with dignified work, fair wages, and creative respect.</p>
        </div>
      </div>
    </section>

    {/* Visit Banner */}
    <section className="cta-banner">
      <div className="cta-inner">
        <p className="public-eyebrow" style={{ color: '#F4C7B7' }}>Visit Our Studio</p>
        <h2>Experience the atelier firsthand.</h2>
        <p>Walk through our textile library, view ongoing artisan embroidery, and discuss your bespoke piece in person.</p>
        <div className="cta-actions">
          <Link className="public-button primary" to="/contact">
            Plan Your Studio Visit <FiArrowRight />
          </Link>
          <Link className="public-button outline" to="/product">
            Browse The Collection
          </Link>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default About;
