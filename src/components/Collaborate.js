import React, { useState } from 'react';
import PublicLayout from './PublicLayout';
import { addCollaboratorInquiry } from '../services/collaboratorService';
import { triggerInAppNotification } from '../contexts/NotificationContext';
import {
  FiCheckCircle,
  FiInstagram,
  FiSend,
  FiStar,
  FiUsers,
  FiAward,
  FiHeart,
  FiCamera,
} from 'react-icons/fi';
import '../public.css';

const Collaborate = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    instagramHandle: '',
    platform: 'Instagram',
    followers: '',
    phone: '',
    email: '',
    city: 'Surat',
    collabType: 'Bridal Campaign Shoot',
    portfolioUrl: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addCollaboratorInquiry({
        ...formData,
        fullName: formData.fullName.trim(),
        instagramHandle: formData.instagramHandle.replace('@', '').trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        city: formData.city.trim(),
      });

      try {
        triggerInAppNotification(
          'New Collaborator Inquiry! ✨',
          `${formData.fullName} (@${formData.instagramHandle}) applied for collaboration.`,
          'success'
        );
      } catch (err) {
        // Notification context optional
      }

      setSubmitted(true);
      setFormData({
        fullName: '',
        instagramHandle: '',
        platform: 'Instagram',
        followers: '',
        phone: '',
        email: '',
        city: 'Surat',
        collabType: 'Bridal Campaign Shoot',
        portfolioUrl: '',
        message: '',
      });
    } catch (err) {
      console.error(err);
      alert('Could not submit collaboration form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="contact-page" style={{ paddingTop: '40px' }}>
        {/* Hero Section */}
        <div className="contact-hero" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="public-eyebrow">
            <FiStar /> INFLUENCER & CREATOR PARTNERSHIPS
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: '14px', color: 'var(--pub-text-dark)' }}>
            Collaborate with <span style={{ color: 'var(--pub-primary)' }}>Naari Art Atelier</span>
          </h1>
          <p style={{ maxWidth: '680px', margin: '0 auto', color: 'var(--pub-text-muted)', fontSize: '15px' }}>
            Are you a fashion creator, wedding blogger, bridal model, or celebrity stylist? Partner with our Surat luxury couture atelier for exclusive festive campaigns, bridal shoots, and bespoke styling.
          </p>
        </div>

        {/* Benefits Ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            maxWidth: '1100px',
            margin: '0 auto 48px auto',
          }}
        >
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--pub-border)', textAlign: 'center' }}>
            <FiCamera size={26} style={{ color: 'var(--pub-primary)', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Bespoke Couture Gifting</h4>
            <p style={{ fontSize: '13px', color: 'var(--pub-text-muted)', margin: 0 }}>Handcrafted outfits tailored to your exact measurements.</p>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--pub-border)', textAlign: 'center' }}>
            <FiUsers size={26} style={{ color: 'var(--pub-primary)', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>High Visibility</h4>
            <p style={{ fontSize: '13px', color: 'var(--pub-text-muted)', margin: 0 }}>Cross-promotion across our premium wedding clientele network.</p>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--pub-border)', textAlign: 'center' }}>
            <FiAward size={26} style={{ color: 'var(--pub-primary)', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Long-Term Retainer</h4>
            <p style={{ fontSize: '13px', color: 'var(--pub-text-muted)', margin: 0 }}>Brand ambassador opportunities for top-performing creators.</p>
          </div>
        </div>

        {/* Main Form Container */}
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          {submitted ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '48px 28px',
                textAlign: 'center',
                border: '1px solid var(--pub-border)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  margin: '0 auto 18px auto',
                }}
              >
                <FiCheckCircle />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px', color: 'var(--pub-text-dark)' }}>
                Application Received! 🌸
              </h2>
              <p style={{ color: 'var(--pub-text-muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
                Thank you for your interest in partnering with Naari Art. Our PR & styling team will review your profile and reach out via WhatsApp / Email within 48 hours.
              </p>
              <button
                type="button"
                className="public-button primary"
                onClick={() => setSubmitted(false)}
                style={{ margin: '0 auto' }}
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <div
              className="contact-form-card"
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '36px 30px',
                border: '1px solid var(--pub-border)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ borderBottom: '1px solid var(--pub-border)', paddingBottom: '16px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--pub-text-dark)', margin: '0 0 6px 0' }}>
                  Creator & Stylist Application
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--pub-text-muted)' }}>
                  Fill in your details and our team will get in touch with you directly.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Krisha Vashi"
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      Instagram / Social Handle *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>@</span>
                      <input
                        type="text"
                        name="instagramHandle"
                        value={formData.instagramHandle}
                        onChange={handleChange}
                        placeholder="your_handle"
                        required
                        style={{ width: '100%', padding: '10px 14px 10px 30px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      Primary Platform *
                    </label>
                    <select
                      name="platform"
                      value={formData.platform}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box' }}
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Celebrity Stylist">Celebrity Stylist</option>
                      <option value="Fashion Blogger">Fashion Blogger</option>
                      <option value="Bridal Model">Bridal Model / Model</option>
                      <option value="PR Agency">PR & Talent Agency</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      Followers / Audience Reach *
                    </label>
                    <input
                      type="text"
                      name="followers"
                      value={formData.followers}
                      onChange={handleChange}
                      placeholder="e.g. 85K or 200K"
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      WhatsApp / Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 98250 12345"
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. creator@gmail.com"
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      City / Base Location *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Surat, Mumbai, Ahmedabad"
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      Collaboration Type
                    </label>
                    <select
                      name="collabType"
                      value={formData.collabType}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box' }}
                    >
                      <option value="Bridal Campaign Shoot">Bridal Campaign Shoot</option>
                      <option value="Barter Outfit">Barter Outfit (Reel + Stories)</option>
                      <option value="Paid Promotion">Paid Promotion</option>
                      <option value="Red Carpet Sourcing">Red Carpet Sourcing</option>
                      <option value="Brand Ambassador">Brand Ambassador</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    Portfolio / Media Kit Link (Optional)
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://instagram.com/yourhandle or drive link"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    Tell Us About Your Idea / Proposal
                  </label>
                  <textarea
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe how you would style our couture or details of your upcoming shoot/event..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="public-button primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                >
                  {loading ? 'Submitting Application...' : (
                    <>
                      Submit Collaboration Inquiry <FiSend style={{ marginLeft: '6px' }} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Collaborate;
