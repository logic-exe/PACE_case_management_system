import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDriveAuth } from '../hooks/useDriveAuth';
import { MdDashboard, MdFolder, MdPeople, MdLink, MdCheckCircle, MdLogout } from 'react-icons/md';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isConnected, connectGoogleDrive, disconnectGoogleDrive } = useDriveAuth();
  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">P</div>
        <div className="brand-text">
          <div className="brand-title">PACE Foundation</div>
          <div className="brand-subtitle">Case Management</div>
        </div>
      </div>

      <nav className="nav-group">
        <NavLink to="/dashboard" className={({isActive: active}) => `nav-item ${active ? 'active' : ''}`}>
          <span className="nav-icon"><MdDashboard /></span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/cases" className={({isActive: active}) => `nav-item ${active || isActive('/cases') ? 'active' : ''}`}>
          <span className="nav-icon"><MdFolder /></span>
          <span>All Cases</span>
        </NavLink>
        <NavLink to="/beneficiaries" className={({isActive: active}) => `nav-item ${active ? 'active' : ''}`}>
          <span className="nav-icon"><MdPeople /></span>
          <span>Beneficiaries</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-links">
          {!isConnected && (
            <button 
              className="footer-btn" 
              type="button"
              onClick={connectGoogleDrive}
            >
              <MdLink /> Connect Drive
            </button>
          )}
          {isConnected && (
            <button 
              className="footer-btn" 
              type="button"
              onClick={disconnectGoogleDrive}
            >
              <MdCheckCircle /> Drive Connected
            </button>
          )}
          <button className="footer-btn" type="button" onClick={handleLogout}>
            <MdLogout /> Logout
          </button>
        </div>
        <div className="user-card">
          <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div>
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email || 'user@pace.org'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Layout = () => {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect once, after loading completes
    if (!loading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && !currentPath.startsWith('/google/callback')) {
        navigate('/login', { replace: true });
      }
    }
  }, [loading, isAuthenticated, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Don't render layout if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
