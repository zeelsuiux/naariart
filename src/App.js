import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.js';
import Settings from './components/Settings.js';
import Dashboard from './components/Dashboard.js';
import Customer from './components/Customer.js';
import AddEditCustomer from './components/AddEditCustomer.js';
import ViewCustomer from './components/ViewCustomer.js';
import Order from './components/Order.js';
import Team from './components/Team.js';
import Tasks from './components/Tasks.js';
import TaskDetail from './components/TaskDetail.js';
import Product from './components/Product.js';
import AddEditProduct from './components/AddEditProduct.js';
import ViewProduct from './components/ViewProduct.js';
import AddEditOrder from './components/AddEditOrder.js';
import ViewOrder from './components/ViewOrder.js';
import Chat from './components/Chat.js';
import ExpenseAlert from './components/ExpenseAlert.js';
import Reports from './components/Reports.js';
import './styles.css';
import './utils/theme';
import { storage } from './utils/storage';
import { LoadingProvider } from './contexts/LoadingContext.js';
import Invoice from './components/Invoice.js';
import InvoiceView from './components/InvoiceView.js';
import CalendarPage from './components/CalendarPage.js';
import Home from './components/Home.js';
import About from './components/About.js';
import PublicProduct from './components/PublicProduct.js';
import ProductDetail from './components/ProductDetail.js';
import Contact from './components/Contact.js';
import Leads from './components/Leads.js';
import Collaborate from './components/Collaborate.js';
import Collaborators from './components/Collaborators.js';
import { NotificationProvider } from './contexts/NotificationContext.js';
import GlobalNotificationToast from './components/GlobalNotificationToast.js';
import CommandPalette from './components/CommandPalette.js';
import ExportModal from './components/ExportModal.js';


// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleResetHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/';
    window.location.reload();
  };

  handleResetSession = () => {
    try {
      storage.clearAuthData();
    } catch (e) {
      localStorage.clear();
    }
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/login';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || this.state.error?.toString() || 'Unknown UI Error';
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF7F2',
          padding: '24px',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '36px 32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid #EBE4DA',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FDF2ED',
              color: '#B84F2A',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginBottom: '18px',
              fontWeight: '700'
            }}>
              !
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1E1B18', margin: '0 0 10px' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '14.5px', color: '#685D52', margin: '0 0 24px', lineHeight: 1.5 }}>
              A temporary display error occurred. You can refresh or return to the main portal smoothly.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#B84F2A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(184, 79, 42, 0.25)'
                }}
              >
                ↻ Refresh Page
              </button>
              <button
                type="button"
                onClick={this.handleResetHome}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1E1B18',
                  border: '1px solid #D5C9B8',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Go to Home
              </button>
              <button
                type="button"
                onClick={this.handleResetSession}
                style={{
                  backgroundColor: 'transparent',
                  color: '#8A7A6B',
                  border: 'none',
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Reset Studio Session
              </button>
            </div>

            <details style={{ textAlign: 'left', marginTop: '16px' }}>
              <summary style={{ cursor: 'pointer', fontSize: '12.5px', color: '#8A7A6B', outline: 'none' }}>
                Error Details
              </summary>
              <pre style={{
                background: '#FAF7F2',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                color: '#B84F2A',
                overflowX: 'auto',
                marginTop: '8px',
                border: '1px solid #EBE4DA',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {errorMsg}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProtectedRoute = ({ isLoggedIn, children }) => {
  const isAuth = isLoggedIn || storage.isAuthenticated();
  return isAuth ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ isLoggedIn, children }) => {
  const isAuth = isLoggedIn || storage.isAuthenticated();
  if (!isAuth) return <Navigate to="/login" replace />;
  return storage.isAdmin() ? children : <Navigate to="/dashboard" replace />;
};

// Global overlays for Command Palette, Export Modal, and Screen Toasts
const GlobalOverlays = () => {
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };

    const handleOpenExport = () => setIsExportOpen(true);
    const handleOpenCmd = () => setIsCmdOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('naari-open-export', handleOpenExport);
    window.addEventListener('naari-open-command-palette', handleOpenCmd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('naari-open-export', handleOpenExport);
      window.removeEventListener('naari-open-command-palette', handleOpenCmd);
    };
  }, []);

  return (
    <>
      <GlobalNotificationToast />
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onOpenExport={() => setIsExportOpen(true)}
      />
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load and page refresh
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = storage.getToken();
        const user = storage.getUser();
        // If one is present without the other, auto-clean to prevent partial zombie state
        if ((token && !user) || (!token && user)) {
          console.warn('Inconsistent session tokens detected, healing session...');
          storage.clearAuthData();
          setIsLoggedIn(false);
        } else {
          setIsLoggedIn(Boolean(token && user));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        storage.clearAuthData();
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    storage.clearAuthData();
    setIsLoggedIn(false);
  };

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Inter, Roboto, Arial, sans-serif',
        fontSize: '16px',
        color: '#B84F2A',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #B84F2A', 
            borderRadius: '50%', 
            margin: '0 auto 20px'
          }} className="loading-spinner"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <LoadingProvider>
          <Router>
            <div className="App">
              <GlobalOverlays />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/product" element={<PublicProduct />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/collaborate" element={<Collaborate />} />
                <Route path="/collaborator" element={<Collaborate />} />
                <Route path="/invoice-view" element={<InvoiceView />} />
                <Route path="/invoice-view/:orderId" element={<InvoiceView />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />

                <Route path="/dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Dashboard onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/collaborators" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Collaborators onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Settings onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Customer onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/customers/add" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AddEditCustomer onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/customers/edit/:customerId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AddEditCustomer onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/customers/view/:customerId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ViewCustomer onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Order onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/orders/add" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AddEditOrder onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/orders/edit/:orderId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AddEditOrder onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/orders/view/:orderId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ViewOrder onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/team" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Team onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/leads" element={<AdminRoute isLoggedIn={isLoggedIn}><Leads onLogout={handleLogout} /></AdminRoute>} />
                <Route path="/tasks" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Tasks onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/tasks/:orderId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><TaskDetail onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Product onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/products/add" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AddEditProduct onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/products/edit/:productId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AddEditProduct onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/products/view/:productId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ViewProduct onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Chat onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/alert" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ExpenseAlert onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Reports onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/invoice" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Invoice onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute isLoggedIn={isLoggedIn}><CalendarPage onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </LoadingProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
