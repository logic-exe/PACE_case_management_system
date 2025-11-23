import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardAPI, eventAPI } from '../services/apiService';
import toast from 'react-hot-toast';
import { MdSearch, MdLocationOn, MdAccessTime } from 'react-icons/md';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCases: 0,
    ongoingCases: 0,
    disposedCases: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    event_type: '',
    search: '',
    days: '7',
    dateFilter: '' // Add date filter for cases
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allEvents]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        dashboardAPI.getStats(),
        eventAPI.getUpcoming(30)
      ]);
      setStats(statsRes.data);
      setAllEvents(eventsRes.data.events || []);
      setUpcomingEvents(eventsRes.data.events || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allEvents];

    // Filter by event type
    if (filters.event_type) {
      filtered = filtered.filter(e => e.event_type === filters.event_type);
    }

    // Filter by search term (case code, beneficiary name, event title)
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.case_code?.toLowerCase().includes(search) ||
        e.beneficiary_name?.toLowerCase().includes(search) ||
        e.event_title?.toLowerCase().includes(search)
      );
    }

    // Filter by days range
    const daysLimit = parseInt(filters.days);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysLimit);

    filtered = filtered.filter(e => {
      const eventDate = new Date(e.event_date);
      return eventDate >= today && eventDate <= futureDate;
    });

    setUpcomingEvents(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      event_type: '',
      search: '',
      days: '7'
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-header-main">
          <div className="header-left">
            <h1>Case Management Dashboard</h1>
            <p>Track and manage all ongoing cases for PACE Foundation</p>
          </div>
          <Link to="/new-case" className="btn-add-case">
            <span>+</span> Add New Case
          </Link>
        </div>

        <div className="stats-grid-4">
          <div className="stat-card-new">
            <h3>Total Cases</h3>
            <p className="stat-number">{stats.totalCases}</p>
          </div>

          <div className="stat-card-new active">
            <h3>Active Cases</h3>
            <p className="stat-number stat-active">{stats.ongoingCases}</p>
          </div>

          <div className="stat-card-new pending">
            <h3>Pending Cases</h3>
            <p className="stat-number stat-pending">{stats.totalCases - stats.ongoingCases - stats.disposedCases}</p>
          </div>

          <div className="stat-card-new resolved">
            <h3>Resolved Cases</h3>
            <p className="stat-number stat-resolved">{stats.disposedCases}</p>
          </div>
        </div>

        <div className="filters-section-dashboard">
          <div className="search-box">
            <span className="search-icon"><MdSearch /></span>
            <input
              type="text"
              placeholder="Search by beneficiary name or case number"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input-dashboard"
            />
          </div>

          <select
            value={filters.case_type}
            onChange={(e) => handleFilterChange('case_type', e.target.value)}
            className="filter-select"
          >
            <option value="">All Legal Actions</option>
            <option value="Domestic Violence">Domestic Violence</option>
            <option value="Child Custody">Child Custody</option>
            <option value="Property Dispute">Property Dispute</option>
            <option value="Consumer Rights">Consumer Rights</option>
            <option value="Labor Rights">Labor Rights</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="urgent">Urgent</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filters.event_type}
            onChange={(e) => handleFilterChange('event_type', e.target.value)}
            className="filter-select"
          >
            <option value="">All Case Types</option>
            <option value="Court Hearing">Court Hearing</option>
            <option value="Counseling Session">Counseling Session</option>
            <option value="Mediation Meeting">Mediation Meeting</option>
            <option value="Document Submission">Document Submission</option>
          </select>
        </div>

        <div className="upcoming-events-section">
          <div className="section-header">
            <h2>Upcoming Events</h2>
          </div>

          <div className="cases-count">
            <p>Showing {upcomingEvents.length} of {allEvents.length} events</p>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="empty-state">
              <p>No events found matching your filters</p>
            </div>
          ) : (
            <div className="events-list">
              {upcomingEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="event-card clickable-card"
                  onClick={() => navigate(`/cases/${event.case_id}`)}
                >
                  <div className="event-date">
                    <span className="date-day">{new Date(event.event_date).getDate()}</span>
                    <span className="date-month">
                      {new Date(event.event_date).toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                  </div>
                  <div className="event-details">
                    <h3>{event.event_title}</h3>
                    <p className="event-meta">
                      <span className="case-code">{event.case_code}</span>
                      <span className="beneficiary">{event.beneficiary_name}</span>
                    </p>
                    <p className="event-info">
                      <span><MdLocationOn style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {event.location}</span>
                      <span><MdAccessTime style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {event.event_time}</span>
                    </p>
                  </div>
                  <div className="event-type">
                    <span className="badge">{event.event_type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
