import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles.css';
import { authAPI } from '../services/api';
import { storage } from '../utils/storage';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@naariart.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (storage.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleDemoLogin = () => {
    const defaultAdmin = {
      fullName: 'Master Admin',
      userName: 'admin@naariart.com',
      type: 'admin',
      roleid: {
        name: 'Master Admin',
        ismaster: true,
        permissions: [
          { collectionName: 'customer', view: true, insertUpdate: true, delete: true },
          { collectionName: 'customers', view: true, insertUpdate: true, delete: true },
          { collectionName: 'order', view: true, insertUpdate: true, delete: true },
          { collectionName: 'orders', view: true, insertUpdate: true, delete: true },
          { collectionName: 'lead', view: true, insertUpdate: true, delete: true },
          { collectionName: 'leads', view: true, insertUpdate: true, delete: true },
          { collectionName: 'product', view: true, insertUpdate: true, delete: true },
          { collectionName: 'products', view: true, insertUpdate: true, delete: true },
          { collectionName: 'task', view: true, insertUpdate: true, delete: true },
          { collectionName: 'tasks', view: true, insertUpdate: true, delete: true },
          { collectionName: 'staff', view: true, insertUpdate: true, delete: true },
          { collectionName: 'settings', view: true, insertUpdate: true, delete: true },
          { collectionName: 'reports', view: true, insertUpdate: true, delete: true },
          { collectionName: 'finance', view: true, insertUpdate: true, delete: true }
        ]
      }
    };
    storage.setAuthData('demo-preview-token', defaultAdmin);
    onLogin();
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Allow demo credentials to enter directly
      if (
        (email.trim().toLowerCase() === 'admin@naariart.com' || email.trim().toLowerCase() === 'admin') &&
        password.trim() === 'admin123'
      ) {
        handleDemoLogin();
        return;
      }

      // Call login API
      const response = await authAPI.login(email.trim(), password);
      
      if (response && response.token) {
        storage.setAuthData(response.token, response.user);
        onLogin();
        navigate('/dashboard');
      } else {
        setError(response?.message || 'Invalid email or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const apiMessage = err?.response?.data?.Message || err?.response?.data?.message || err?.message;
      setError(apiMessage || 'Invalid email or password. Please verify credentials or use One-Click Demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* Right Side - Login Form */}
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-header">
            <div className="login-logo">
              <div className="login-logo-icon"><img src={require('../assets/naari-logo.png')} alt="Naari Art" className='login-logo' /></div>
              <div className="login-logo-text">Naari Art</div>
            </div>
            <h2 className="login-title">Sign In</h2>
            <p className="login-subtitle">Enter your credentials to access your account</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="text"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="password-input-wrapper" style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="form-error" style={{ color: 'var(--alert-color)', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <button
            type="button"
            className="mm-btn-secondary"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{ width: '100%', marginTop: '10px', height: '42px', fontSize: '13.5px', justifyContent: 'center' }}
          >
            Explore Demo Studio ERP (One-Click)
          </button>

        <p style={{textAlign: 'center', marginTop: '16px'}}>
          <Link to="/" style={{color: 'var(--primary-color)', textDecoration: 'none'}}>← Back to Visitor Atelier</Link>
        </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
