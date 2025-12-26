import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { caseAPI, eventAPI } from '../services/apiService';
import { useDriveAuth } from '../hooks/useDriveAuth';
import toast from 'react-hot-toast';
import { MdArrowBack, MdSearch, MdLink } from 'react-icons/md';

const AddEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, connectGoogleDrive } = useDriveAuth();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCase, setLoadingCase] = useState(false);
  const [eventData, setEventData] = useState({
    case_id: '',
    event_type: '',
    event_title: '',
    event_date: '',
    event_time: '',
    location: '',
    description: '',
    event_status: 'scheduled',
    google_drive_url: ''
  });
  const [caseSearchQuery, setCaseSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      // Check if caseId is passed via URL query parameter
      const searchParams = new URLSearchParams(location.search);
      const caseId = searchParams.get('caseId');
      
      if (caseId) {
        // If coming from case page, load the case first
        setLoadingCase(true);
        try {
          await handleCaseSelect(caseId);
        } catch (error) {
          console.error('Error loading case:', error);
        } finally {
          setLoadingCase(false);
        }
      }
      
      // Always fetch cases list (for search functionality)
      await fetchCases();
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const fetchCases = async () => {
    try {
      const response = await caseAPI.getAll();
      setCases(response.data.cases);
    } catch (error) {
      toast.error('Failed to load cases');
    }
  };

  const handleCaseSelect = async (caseId) => {
    setEventData(prev => ({ ...prev, case_id: caseId }));
    try {
      const response = await caseAPI.getById(caseId);
      const caseData = response.data.case;
      setSelectedCase(caseData);
      // Auto-populate Google Drive URL from case
      if (caseData.google_drive_url) {
        setEventData(prev => ({ ...prev, google_drive_url: caseData.google_drive_url }));
      }
    } catch (error) {
      toast.error('Failed to load case details');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
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

  const filteredCases = cases.filter(caseItem => {
    if (!caseSearchQuery) return true;
    const query = caseSearchQuery.toLowerCase();
    return (
      caseItem.case_code?.toLowerCase().includes(query) ||
      caseItem.beneficiary_name?.toLowerCase().includes(query) ||
      caseItem.case_type?.toLowerCase().includes(query) ||
      caseItem.case_title?.toLowerCase().includes(query)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!eventData.case_id || !eventData.event_type || !eventData.event_title) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // Use case's google drive folder if available
      const eventPayload = { ...eventData };
      if (selectedCase?.google_drive_folder_id && !eventPayload.google_drive_url) {
        eventPayload.google_drive_url = selectedCase.google_drive_url;
      }
      
      await eventAPI.createEvent(eventData.case_id, eventPayload);
      
      toast.success('Event created successfully!');
      
      // Dispatch custom events to notify other pages to refresh
      window.dispatchEvent(new CustomEvent('eventUpdated', { 
        detail: { caseId: eventData.case_id, created: true } 
      }));
      // Also dispatch caseUpdated since case status may have changed to pending
      window.dispatchEvent(new CustomEvent('caseUpdated', { 
        detail: { caseId: eventData.case_id, updated: true } 
      }));
      
      // Navigate back to the case page if we came from there, otherwise go to dashboard
      if (location.search.includes('caseId')) {
        navigate(`/cases/${eventData.case_id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-container">
        <div className="page-header-with-back">
          <button onClick={() => navigate(-1)} className="btn-back">
            <MdArrowBack /> Back
          </button>
          <div>
            <h1>Add Event</h1>
            <p>Schedule a new case event</p>
          </div>
        </div>

        <div className={`add-event-layout ${location.search.includes('caseId') ? 'full-width-form' : ''}`}>
          {!location.search.includes('caseId') && (
            <div className="case-list-panel">
              <h2>Select Case</h2>
              <div className="case-search-box" style={{ marginBottom: 'var(--spacing-md)' }}>
                <MdSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search by case code, beneficiary name, or case type..."
                  value={caseSearchQuery}
                  onChange={(e) => setCaseSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) 2.75rem',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '9999px',
                    fontSize: '1rem',
                    background: 'var(--bg-secondary)',
                    height: '48px'
                  }}
                />
              </div>
              <div className="case-list">
                {filteredCases.length === 0 ? (
                  <div className="empty-state">
                    <p>No cases found matching your search</p>
                  </div>
                ) : (
                  filteredCases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className={`case-item ${eventData.case_id === caseItem.id ? 'selected' : ''}`}
                      onClick={() => handleCaseSelect(caseItem.id)}
                    >
                      <div className="case-code">{caseItem.case_code}</div>
                      <div className="case-info">
                        <strong>{caseItem.beneficiary_name}</strong>
                        <p>{caseItem.case_type}</p>
                      </div>
                      <span className={`badge ${getStatusBadgeClass(caseItem.status)}`}>
                        {caseItem.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="event-form-panel" style={location.search.includes('caseId') ? { width: '100%' } : {}}>
            {loadingCase ? (
              <div className="empty-state">
                <div className="spinner"></div>
                <p>Loading case details...</p>
              </div>
            ) : !selectedCase ? (
              <div className="empty-state">
                <p>{location.search.includes('caseId') ? 'Case not found' : '← Select a case from the left to add an event'}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="event-form">
                <div className="selected-case-info">
                  <h3>Selected Case: {selectedCase.case_code}</h3>
                  <p><strong>Beneficiary:</strong> {selectedCase.beneficiary_name}</p>
                  <p><strong>Contact:</strong> {selectedCase.contact_number}</p>
                </div>

                <div className="form-section">
                  <h2>Event Details</h2>
                  
                  <div className="form-group">
                    <label htmlFor="event_type">Event Type *</label>
                    <select
                      id="event_type"
                      name="event_type"
                      value={eventData.event_type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select Type --</option>
                      <option value="Court Hearing">Court Hearing</option>
                      <option value="Counseling Session">Counseling Session</option>
                      <option value="Mediation Meeting">Mediation Meeting</option>
                      <option value="Document Submission">Document Submission</option>
                      <option value="Evidence Collection">Evidence Collection</option>
                      <option value="Client Meeting">Client Meeting</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="event_title">Event Title *</label>
                    <input
                      type="text"
                      id="event_title"
                      name="event_title"
                      value={eventData.event_title}
                      onChange={handleInputChange}
                      placeholder="Brief description of the event"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="event_date">Date *</label>
                      <input
                        type="date"
                        id="event_date"
                        name="event_date"
                        value={eventData.event_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="event_time">Time *</label>
                      <input
                        type="time"
                        id="event_time"
                        name="event_time"
                        value={eventData.event_time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={eventData.location}
                      onChange={handleInputChange}
                      placeholder="Event location"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={eventData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Additional event details..."
                    />
                  </div>

                  {isConnected && selectedCase?.google_drive_url ? (
                    <div className="form-group">
                      <label>Google Drive Folder</label>
                      <p style={{ 
                        padding: 'var(--spacing-sm)', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: '0.95rem',
                        color: 'var(--text-secondary)'
                      }}>
                        Using case folder: <a href={selectedCase.google_drive_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>{selectedCase.google_drive_url}</a>
                      </p>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Google Drive</label>
                      {!isConnected ? (
                        <button type="button" onClick={connectGoogleDrive} className="btn-connect-drive">
                          <MdLink /> Connect Google Drive
                        </button>
                      ) : (
                        <p style={{ 
                          padding: 'var(--spacing-sm)', 
                          background: 'var(--bg-secondary)', 
                          borderRadius: 'var(--border-radius-sm)',
                          fontSize: '0.95rem',
                          color: 'var(--text-secondary)'
                        }}>
                          Google Drive not connected to this case
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Event'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddEvent;
