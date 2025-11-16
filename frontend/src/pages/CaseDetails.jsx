import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { caseAPI, eventAPI } from '../services/apiService';
import toast from 'react-hot-toast';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaseDetails();
    fetchCaseEvents();
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      const response = await caseAPI.getById(id);
      setCaseData(response.data.case);
    } catch (error) {
      toast.error('Failed to load case details');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseEvents = async () => {
    try {
      const response = await eventAPI.getByCaseId(id);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to load case events');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDuration = (startDate) => {
    if (!startDate) return 'N/A';
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
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
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading case details...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Case not found</p>
          <Link to="/cases" className="btn-primary">Back to Cases</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container case-details-container">
      {/* Back Button */}
      <button onClick={() => navigate('/cases')} className="btn-back">
        ← Back to All Cases
      </button>

      {/* Case Header Section */}
      <div className="case-header-section">
        <div className="case-title-row">
          <div className="case-title-left">
            <h1 className="case-code-title">{caseData.case_code}</h1>
            <p className="case-beneficiary-name">👤 {caseData.beneficiary_name}</p>
            <span className="case-type-badge">{caseData.case_type}</span>
          </div>
          <div className="case-meta-right">
            <p><strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(caseData.status)}`}>{caseData.status}</span></p>
            <p><strong>Court:</strong> {caseData.court}</p>
            <p><strong>Resolution Type:</strong> {caseData.case_resolution_type}</p>
            <div className="next-court-date">
              📅 Next Hearing: 20 Nov 2025
            </div>
          </div>
        </div>

        <div className="case-description">
          <strong>Case Description:</strong> {caseData.case_title || 'No description provided'}
        </div>

        <div className="case-info-grid">
          <div className="info-item">
            <p>Date Filed</p>
            <strong>{formatDate(caseData.created_at)}</strong>
          </div>
          <div className="info-item">
            <p>Duration</p>
            <strong>{calculateDuration(caseData.created_at)}</strong>
          </div>
          <div className="info-item">
            <p>Total Events</p>
            <strong>{events.length}</strong>
          </div>
        </div>

        <div className="case-actions">
          <Link 
            to={`/add-event?caseId=${caseData.id}`} 
            className="btn-add-event"
          >
            + Add Event
          </Link>
          {caseData.google_drive_url && (
            <a 
              href={caseData.google_drive_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-open-drive"
            >
              📁 Open Drive Folder
            </a>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="timeline-section">
        <h2 className="timeline-header">Case Timeline & Events</h2>

        {events.length === 0 ? (
          <div className="empty-state">
            <p>No events recorded yet for this case</p>
            <Link to={`/add-event?caseId=${caseData.id}`} className="btn-primary">
              + Add First Event
            </Link>
          </div>
        ) : (
          <div className="timeline">
            {events.map((event) => (
              <div key={event.id} className="timeline-item">
                <div className={`timeline-marker ${event.status === 'completed' ? 'completed' : ''}`}>
                  ✓
                </div>
                <div className={`timeline-content ${event.status === 'completed' ? 'completed' : ''}`}>
                  <div className="timeline-date">
                    📅 {formatDate(event.event_date)} {event.event_time && `• 🕐 ${event.event_time}`}
                  </div>
                  <h3 className="timeline-title">{event.event_title}</h3>
                  <p className="timeline-description">{event.description || 'No description provided'}</p>
                  
                  <div className="timeline-meta">
                    {event.location && (
                      <div className="timeline-meta-item">
                        📍 {event.location}
                      </div>
                    )}
                    {event.event_type && (
                      <div className="timeline-meta-item">
                        📋 {event.event_type}
                      </div>
                    )}
                  </div>

                  {event.notes && (
                    <div className="timeline-note">
                      <strong>📝 Note:</strong> {event.notes}
                    </div>
                  )}

                  {event.organizations && event.organizations.length > 0 && (
                    <div className="timeline-organizations">
                      {event.organizations.map((org, idx) => (
                        <span key={idx} className="org-tag">{org}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseDetails;
