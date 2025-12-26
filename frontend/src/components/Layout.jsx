import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDriveAuth } from '../hooks/useDriveAuth';
import { MdDashboard, MdFolder, MdPeople, MdLink, MdCheckCircle, MdLogout, MdArrowDropDown } from 'react-icons/md';

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isConnected, connectGoogleDrive, disconnectGoogleDrive } = useDriveAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const handleConnectDrive = () => {
    connectGoogleDrive();
    setDropdownOpen(false);
  };

  const handleDisconnectDrive = () => {
    disconnectGoogleDrive();
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="top-nav">
      <div className="top-nav-container">
        <div className="top-nav-left">
          <span className="brand-text">PACE Foundation</span>
        </div>

        <div className="top-nav-center">
          <NavLink to="/dashboard" className={({isActive: active}) => `nav-tab ${active ? 'active' : ''}`}>
            <MdDashboard className="nav-tab-icon" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/cases" className={({isActive: active}) => `nav-tab ${active || isActive('/cases') ? 'active' : ''}`}>
            <MdFolder className="nav-tab-icon" />
            <span>All Cases</span>
          </NavLink>
          <NavLink to="/beneficiaries" className={({isActive: active}) => `nav-tab ${active ? 'active' : ''}`}>
            <MdPeople className="nav-tab-icon" />
            <span>Beneficiaries</span>
          </NavLink>
        </div>

        <div className="top-nav-right">
          <div className="admin-dropdown" ref={dropdownRef}>
            <button 
              className="admin-avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Admin menu"
            >
              <div className="admin-avatar">{user?.name?.charAt(0) || 'A'}</div>
              <MdArrowDropDown className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="admin-dropdown-menu">
                {!isConnected ? (
                  <button 
                    className="dropdown-item" 
                    type="button"
                    onClick={handleConnectDrive}
                  >
                    <MdLink /> Connect Drive
                  </button>
                ) : (
                  <button 
                    className="dropdown-item" 
                    type="button"
                    onClick={handleDisconnectDrive}
                  >
                    <MdCheckCircle /> Drive Connected
                  </button>
                )}
                <button 
                  className="dropdown-item" 
                  type="button" 
                  onClick={handleLogout}
                >
                  <MdLogout /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
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
      <TopNav />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
