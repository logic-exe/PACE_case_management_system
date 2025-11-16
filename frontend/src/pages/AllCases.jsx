import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { caseAPI } from '../services/apiService';
import toast from 'react-hot-toast';

const AllCases = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    case_type: '',
    status: '',
    case_resolution_type: '',
    court: ''
  });

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, cases]);

  const fetchCases = async () => {
    try {
      const response = await caseAPI.getAll();
      setCases(response.data.cases);
      setFilteredCases(response.data.cases);
    } catch (error) {
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cases];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.case_code?.toLowerCase().includes(search) ||
        c.beneficiary_name?.toLowerCase().includes(search) ||
        c.case_title?.toLowerCase().includes(search) ||
        c.case_type?.toLowerCase().includes(search)
      );
    }

    if (filters.case_type) {
      filtered = filtered.filter(c => c.case_type === filters.case_type);
    }
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters.case_resolution_type) {
      filtered = filtered.filter(c => c.case_resolution_type === filters.case_resolution_type);
    }
    if (filters.court) {
      filtered = filtered.filter(c => c.court === filters.court);
    }

    setFilteredCases(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      case_type: '',
      status: '',
      case_resolution_type: '',
      court: ''
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      active: 'badge-active',
      pending: 'badge-pending',
      urgent: 'badge-urgent',
      resolved: 'badge-resolved'
    };
    return statusClasses[status] || 'badge-default';
  };

  if (loading) {
    return (
      <>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading cases...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>All Cases</h1>
            <p>Manage and view all legal cases</p>
          </div>
          <Link to="/new-case" className="btn-primary">+ New Case</Link>
        </div>

        {/* Search Bar */}
        <div className="search-bar-container">
          <div className="search-bar">
            <span className="search-icon-input">🔍</span>
            <input
              type="text"
              placeholder="Search by case code, beneficiary name, or case title..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        <div className="filters-section">
          <h3>Filters</h3>
          <div className="filters-grid">
            <select
              value={filters.case_type}
              onChange={(e) => handleFilterChange('case_type', e.target.value)}
            >
              <option value="">All Case Types</option>
              <option value="Domestic Violence">Domestic Violence</option>
              <option value="Child Custody">Child Custody</option>
              <option value="Property Dispute">Property Dispute</option>
              <option value="Consumer Rights">Consumer Rights</option>
              <option value="Labor Rights">Labor Rights</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="urgent">Urgent</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={filters.case_resolution_type}
              onChange={(e) => handleFilterChange('case_resolution_type', e.target.value)}
            >
              <option value="">All Resolution Types</option>
              <option value="Litigation">Litigation</option>
              <option value="Mediation">Mediation</option>
              <option value="Arbitration">Arbitration</option>
              <option value="Legal Aid">Legal Aid</option>
              <option value="Counseling">Counseling</option>
            </select>

            <select
              value={filters.court}
              onChange={(e) => handleFilterChange('court', e.target.value)}
            >
              <option value="">All Courts</option>
              <option value="District Court Delhi">District Court Delhi</option>
              <option value="High Court Delhi">High Court Delhi</option>
              <option value="Family Court">Family Court</option>
              <option value="Consumer Court">Consumer Court</option>
              <option value="Other">Other</option>
            </select>

            <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
          </div>
        </div>

        <div className="cases-count">
          <p>Showing {filteredCases.length} of {cases.length} cases</p>
        </div>

        <div className="cases-table-container">
          <table className="cases-table">
            <thead>
              <tr>
                <th>Case Code</th>
                <th>Beneficiary</th>
                <th>Case Type</th>
                <th>Court</th>
                <th>Resolution Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No cases found</td>
                </tr>
              ) : (
                filteredCases.map((caseItem) => (
                  <tr 
                    key={caseItem.id} 
                    onClick={() => navigate(`/cases/${caseItem.id}`)}
                    className="clickable-row"
                  >
                    <td><strong>{caseItem.case_code}</strong></td>
                    <td>{caseItem.beneficiary_name}</td>
                    <td>{caseItem.case_type}</td>
                    <td>{caseItem.court}</td>
                    <td>{caseItem.case_resolution_type}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(caseItem.status)}`}>
                        {caseItem.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AllCases;
