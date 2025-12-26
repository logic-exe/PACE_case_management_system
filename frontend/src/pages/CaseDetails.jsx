import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { caseAPI, eventAPI } from '../services/apiService';
import { useDriveAuth } from '../hooks/useDriveAuth';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import toast from 'react-hot-toast';
import { MdEdit, MdDelete, MdAccessTime, MdLocationOn, MdFolder, MdPerson, MdLink, MdNote } from 'react-icons/md';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentsRefresh, setDocumentsRefresh] = useState(0);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { driveToken, isConnected, connectGoogleDrive } = useDriveAuth();

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
      const eventsList = response.data.events || [];
      // Sort events by date - nearest (upcoming) first
      const sortedEvents = eventsList.sort((a, b) => {
        const dateA = new Date(a.event_date);
        const dateB = new Date(b.event_date);
        return dateA - dateB; // Ascending order - nearest first
      });
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Failed to load case events');
    }
  };

  const deleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await eventAPI.deleteEvent(eventId);
        toast.success('Event deleted successfully');
        fetchCaseEvents(); // Refresh events
        fetchCaseDetails(); // Refresh case details (status may have changed)
        
        // Dispatch custom events to notify other pages to refresh
        window.dispatchEvent(new CustomEvent('eventUpdated', { 
          detail: { eventId, deleted: true } 
        }));
        // Also dispatch caseUpdated since case status may have changed back to active
        window.dispatchEvent(new CustomEvent('caseUpdated', { 
          detail: { caseId: id, updated: true } 
        }));
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const editEvent = (eventId) => {
    navigate(`/edit-event/${eventId}?caseId=${id}`);
  };

  const deleteCase = async () => {
    if (window.confirm('Are you sure you want to delete this case? This will also delete all associated events and documents. This action cannot be undone.')) {
      try {
        await caseAPI.delete(id);
        toast.success('Case deleted successfully');
        
        // Dispatch custom event to notify other pages to refresh
        window.dispatchEvent(new CustomEvent('caseUpdated', { 
          detail: { caseId: id, deleted: true } 
        }));
        
        navigate('/cases');
      } catch (error) {
        toast.error('Failed to delete case');
      }
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

  const handleStatusClick = (e) => {
    e.stopPropagation();
    setOpenStatusDropdown(!openStatusDropdown);
  };

  const handleStatusChange = async (e, newStatus) => {
    e.stopPropagation();
    setUpdatingStatus(true);
    try {
      await caseAPI.update(id, { status: newStatus });
      setCaseData(prev => ({ ...prev, status: newStatus }));
      toast.success(`Case status updated to ${newStatus}`);
      setOpenStatusDropdown(false);
      
      // Dispatch custom event to notify other pages to refresh
      window.dispatchEvent(new CustomEvent('caseUpdated', { 
        detail: { caseId: id, status: newStatus } 
      }));
    } catch (error) {
      toast.error('Failed to update case status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openStatusDropdown) {
        const container = document.querySelector('.status-dropdown-container');
        if (container && !container.contains(e.target)) {
          setOpenStatusDropdown(false);
        }
      }
    };

    if (openStatusDropdown) {
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openStatusDropdown]);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 className="case-code-title">{caseData.case_code}</h1>
              <span className="case-type-badge">{caseData.case_type}</span>
            </div>
            {caseData.beneficiary_name && (
              <span className="beneficiary-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <MdPerson style={{ fontSize: '0.875rem' }} />
                {caseData.beneficiary_name}
              </span>
            )}
          </div>
          <div className="case-meta-right">
            <p>
              <strong>Status:</strong>{' '}
              <span className="status-dropdown-container">
                <button
                  className={`badge ${getStatusBadgeClass(caseData.status)} status-badge-btn`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusClick(e);
                  }}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? 'Updating...' : caseData.status}
                </button>
                {openStatusDropdown && (
                  <div className="status-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="dropdown-item"
                      onClick={(e) => handleStatusChange(e, 'active')}
                    >
                      Active
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={(e) => handleStatusChange(e, 'pending')}
                    >
                      Pending
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={(e) => handleStatusChange(e, 'resolved')}
                    >
                      Resolved
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={(e) => handleStatusChange(e, 'urgent')}
                    >
                      Urgent
                    </button>
                  </div>
                )}
              </span>
            </p>
            {caseData.court && <p><strong>Court:</strong> {caseData.court}</p>}
            {caseData.case_resolution_type && <p><strong>Resolution Type:</strong> {caseData.case_resolution_type}</p>}
          </div>
        </div>

        <div className="case-description">
          <strong>Case Description:</strong>
          <div style={{ marginTop: '0.5rem' }}>{caseData.case_title || 'No description provided'}</div>
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
          {isConnected && caseData.google_drive_url && (
            <a 
              href={caseData.google_drive_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-open-drive"
            >
              <MdFolder /> Open Drive Folder
            </a>
          )}
          <Link
            to={`/edit-case/${id}`}
            className="btn-secondary"
            style={{ 
              background: 'var(--primary-color)', 
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none'
            }}
          >
            <MdEdit /> Edit Case
          </Link>
          <button
            onClick={deleteCase}
            className="btn-secondary"
            style={{ 
              background: 'var(--danger-color)', 
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <MdDelete /> Delete Case
          </button>
        </div>
      </div>

      {/* Documents Section */}
      <div className="documents-section">
        <div className="section-header-with-action">
          <h2 className="section-header">Documents</h2>
        </div>

        {isConnected ? (
          <>
            <DocumentUpload 
              caseId={id} 
              driveToken={driveToken}
              onUploadSuccess={() => setDocumentsRefresh(prev => prev + 1)}
            />
            <DocumentList 
              caseId={id} 
              driveToken={driveToken}
              refreshTrigger={documentsRefresh}
            />
          </>
        ) : (
          <div className="empty-state">
            <p>Connect Google Drive to upload and manage documents</p>
            <button onClick={connectGoogleDrive} className="btn-primary">
              Connect Google Drive
            </button>
          </div>
        )}
      </div>

      {/* Timeline Section */}
      <div className="timeline-section">
        <div className="section-header">
          <h2 className="timeline-header">Case Timeline & Events</h2>
          <Link 
            to={`/add-event?caseId=${caseData.id}`} 
            className="btn-primary"
          >
            + Add Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <p>No events recorded yet for this case</p>
          </div>
        ) : (
          <div className="events-list">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-date">
                  <span className="date-day">{new Date(event.event_date).getDate()}</span>
                  <span className="date-month">
                    {new Date(event.event_date).toLocaleDateString('en-IN', { month: 'short' })}
                  </span>
                </div>
                <div className="event-details">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                    <div>
                      <h3>{event.event_type || 'Event'}</h3>
                      {event.event_title && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                          {event.event_title}
                        </p>
                      )}
                    </div>
                    <div className="timeline-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          editEvent(event.id);
                        }}
                        className="timeline-action-btn edit-btn"
                        title="Edit Event"
                      >
                        <MdEdit />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvent(event.id);
                        }}
                        className="timeline-action-btn delete-btn"
                        title="Delete Event"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                  <p className="event-info">
                    {event.location && <span><MdLocationOn /> {event.location}</span>}
                    {event.event_time && <span><MdAccessTime /> {event.event_time}</span>}
                  </p>
                  {event.description && (
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)', fontSize: '0.95rem' }}>
                      {event.description}
                    </p>
                  )}
                  {event.notes && (
                    <div className="timeline-note" style={{ marginTop: 'var(--spacing-md)' }}>
                      <strong className="icon-with-text"><MdNote /> Note:</strong> {event.notes}
                    </div>
                  )}
                  {event.organizations && event.organizations.length > 0 && (
                    <div className="timeline-organizations" style={{ marginTop: 'var(--spacing-md)' }}>
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
