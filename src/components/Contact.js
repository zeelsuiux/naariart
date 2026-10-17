import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiMail, FiMapPin, FiPhone, FiSend, FiStar } from 'react-icons/fi';
import PublicLayout from './PublicLayout';
import { inquiryAPI } from '../services/api';

const Contact = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const requestedPiece = searchParams.get('piece') || '';

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    state: '',
    city: '',
    message: requestedPiece ? `Inquiring about: ${requestedPiece}\n` : '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (requestedPiece) {
      setFormData((prev) => ({
        ...prev,
        message: prev.message || `Inquiring about: ${requestedPiece}\n`,
      }));
    }
  }, [requestedPiece]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (
      !formData.name.trim() ||
      !formData.contact.trim()
    ) {
      setErrorMessage('Please provide your name and contact phone number.');
      setLoading(false);
      return;
    }

    try {
      await inquiryAPI.addInquiry({
        leadName: formData.name.trim(),
        phone: formData.contact.trim(),
        state: formData.state.trim() || 'Gujarat',
        city: formData.city.trim() || 'Surat',
        leadResponseMessage: formData.message.trim() || 'Website inquiry',
        source: 'Website',
        pipelineStage: 'New',
      });

      setFormData({
        name: '',
        contact: '',
        state: '',
        city: '',
        message: '',
      });

      setSuccessMessage(
        'Thank you! Your enquiry has been received by our atelier. Our stylist will reach out to you within 24 hours.'
      );
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setErrorMessage(
        error.message || 'Something went wrong while submitting. Please call our studio directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="contact-page">
        {/* Contact Hero */}
        <div className="contact-hero">
          <div className="hero-badge">
            <FiStar /> The Naari Art Studio
          </div>
          <h1 className="contact-title">Let’s craft something memorable together.</h1>
          <p className="public-lede">
            For bespoke bridal consultations, custom tailoring inquiries, or questions about the collection, our studio team is delighted to assist you.
          </p>
        </div>

        {/* Contact Main Grid */}
        <div className="contact-container-grid">
          {/* Studio Information Column */}
          <div className="contact-info-col">
            <div className="contact-info-card">
              <h3>Atelier Studio & Visits</h3>
              <p className="info-lead">
                Visit our design studio in Surat to experience handloom textiles, view embroidery swatches, and have your measurements taken in person.
              </p>

              <div className="contact-info-list">
                <div className="info-item">
                  <div className="info-icon"><FiMapPin /></div>
                  <div>
                    <strong>Studio Address</strong>
                    <p>24, Ugameshwar Bungalow, Nr Tapi Arcade, Mota Varachha, Surat - 394101, Gujarat, India</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"><FiPhone /></div>
                  <div>
                    <strong>Telephone & WhatsApp</strong>
                    <p><a href="tel:+919825000000">+91 98250 00000</a></p>
                    <small>Direct line to atelier stylists</small>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"><FiMail /></div>
                  <div>
                    <strong>Email Enquiries</strong>
                    <p><a href="mailto:hello@naariart.com">hello@naariart.com</a></p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"><FiClock /></div>
                  <div>
                    <strong>Studio Hours</strong>
                    <p>Monday to Saturday: 10:00 AM – 8:00 PM</p>
                    <small>Prior appointment recommended for bridal trials</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="contact-form-col">
            <div className="contact-form-card">
              <div className="form-card-header">
                <h3>Send an Enquiry</h3>
                <p>Fill in your details and we will get back to you with custom styling advice and availability.</p>
              </div>

              {requestedPiece && (
                <div className="requested-piece-banner">
                  <FiStar /> Enquiring regarding: <strong>{requestedPiece}</strong>
                </div>
              )}

              {successMessage && (
                <div className="contact-alert success" role="alert">
                  <FiCheckCircle size={20} />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="contact-alert error" role="alert">
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="public-contact-form">
                <div className="form-row">
                  <div className="contact-field">
                    <label htmlFor="contact-name">Your Full Name *</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      placeholder="e.g. Radhika Patel"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-phone">Phone / WhatsApp *</label>
                    <input
                      id="contact-phone"
                      name="contact"
                      type="tel"
                      placeholder="e.g. 98250 12345"
                      value={formData.contact}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="contact-field">
                    <label htmlFor="contact-city">City</label>
                    <input
                      id="contact-city"
                      name="city"
                      type="text"
                      placeholder="e.g. Surat, Ahmedabad, Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-state">State / Country</label>
                    <input
                      id="contact-state"
                      name="state"
                      type="text"
                      placeholder="e.g. Gujarat, India"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="contact-field full">
                  <label htmlFor="contact-message">Your Requirements / Event Details</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="4"
                    placeholder="Tell us about your event date, outfit style (Lehenga, Kurti, Anarkali), or specific embroidery requests..."
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="public-button primary form-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    'Submitting Enquiry...'
                  ) : (
                    <>
                      Submit Consultation Request <FiSend />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;
