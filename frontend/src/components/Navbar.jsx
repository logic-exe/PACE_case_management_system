import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-brand">
          <h2>PACE Foundation</h2>
        </Link>

        <div className="nav-links">
          <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/cases" className={isActive('/cases') ? 'active' : ''}>
            Cases
          </Link>
          <Link to="/beneficiaries" className={isActive('/beneficiaries') ? 'active' : ''}>
            Beneficiaries
          </Link>
          <Link to="/new-case" className={isActive('/new-case') ? 'active' : ''}>
            New Case
          </Link>
          <Link to="/add-event" className={isActive('/add-event') ? 'active' : ''}>
            Add Event
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
