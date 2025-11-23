import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { caseAPI, eventAPI } from '../services/apiService';
import { useDriveAuth } from '../hooks/useDriveAuth';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import toast from 'react-hot-toast';
import { MdEdit, MdDelete, MdCalendarToday, MdAccessTime, MdLocationOn, MdDescription, MdFolder, MdCheckCircle, MdPerson, MdLink, MdNote } from 'react-icons/md';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentsRefresh, setDocumentsRefresh] = useState(0);
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
      setEvents(response.data.events || []);
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
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const editEvent = (eventId) => {
    navigate(`/edit-event/${eventId}?caseId=${id}`);
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
            <p className="case-beneficiary-name"><MdPerson style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {caseData.beneficiary_name}</p>
            <span className="case-type-badge">{caseData.case_type}</span>
          </div>
          <div className="case-meta-right">
            <p><strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(caseData.status)}`}>{caseData.status}</span></p>
            <p><strong>Court:</strong> {caseData.court}</p>
            <p><strong>Resolution Type:</strong> {caseData.case_resolution_type}</p>
            <div className="next-court-date">
              <MdCalendarToday style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Next Hearing: 20 Nov 2025
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
              <MdFolder style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Open Drive Folder
            </a>
          )}
        </div>
      </div>

      {/* Documents Section */}
      <div className="documents-section">
        <div className="section-header-with-action">
          <h2 className="section-header">Documents</h2>
          {!isConnected && (
            <button onClick={connectGoogleDrive} className="btn-connect-drive">
              <MdLink style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Connect Google Drive
            </button>
          )}
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
                  <MdCheckCircle style={{ fontSize: '0.75rem' }} />
                </div>
                <div className={`timeline-content ${event.status === 'completed' ? 'completed' : ''}`}>
                  <div className="timeline-header">
                    <div className="timeline-date">
                      <MdCalendarToday style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {formatDate(event.event_date)} {event.event_time && <><MdAccessTime style={{ verticalAlign: 'middle', marginLeft: '8px', marginRight: '4px' }} /> {event.event_time}</>}
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
                  <h3 className="timeline-title">{event.event_title}</h3>
                  <p className="timeline-description">{event.description || 'No description provided'}</p>
                  
                  {event.location && (
                    <div className="timeline-meta-item">
                      <MdLocationOn style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {event.location}
                    </div>
                  )}
                  {event.event_type && (
                    <div className="timeline-meta-item">
                      <MdDescription style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {event.event_type}
                    </div>
                  )}

                  {event.notes && (
                    <div className="timeline-note">
                      <strong><MdNote style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Note:</strong> {event.notes}
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
