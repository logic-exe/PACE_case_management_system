import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);
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
          <span className="nav-icon">🏠</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/cases" className={({isActive: active}) => `nav-item ${active || isActive('/cases') ? 'active' : ''}`}>
          <span className="nav-icon">📁</span>
          <span>All Cases</span>
        </NavLink>
        <NavLink to="/beneficiaries" className={({isActive: active}) => `nav-item ${active ? 'active' : ''}`}>
          <span className="nav-icon">👤</span>
          <span>Beneficiaries</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-links">
          <button className="footer-btn" type="button">⚙️ Settings</button>
          <button className="footer-btn" type="button">❓ Help & Support</button>
          <button className="footer-btn" type="button">↩️ Logout</button>
        </div>
        <div className="user-card">
          <div className="avatar">A</div>
          <div>
            <div className="user-name">Adv. Meera Patel</div>
            <div className="user-email">meera@pace.org</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Layout = () => {
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
