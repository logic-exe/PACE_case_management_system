import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { caseAPI, eventAPI } from '../services/apiService';
import toast from 'react-hot-toast';

const AddEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);
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
  const [reminderData, setReminderData] = useState({
    send_date: '',
    send_time: ''
  });

  useEffect(() => {
    fetchCases();
    
    // Check if caseId is passed via URL query parameter
    const searchParams = new URLSearchParams(location.search);
    const caseId = searchParams.get('caseId');
    if (caseId) {
      handleCaseSelect(caseId);
    }
  }, [location]);

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
      setSelectedCase(response.data.case);
    } catch (error) {
      toast.error('Failed to load case details');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleReminderChange = (e) => {
    const { name, value } = e.target;
    setReminderData(prev => ({ ...prev, [name]: value }));
  };

  const getReminderMethod = () => {
    if (!selectedCase) return 'N/A';
    
    const { has_smartphone, can_read } = selectedCase;
    
    if (has_smartphone && can_read) return 'WhatsApp Text';
    if (!has_smartphone && can_read) return 'SMS';
    if (has_smartphone && !can_read) return 'WhatsApp Voice Note';
    return 'Manual Call Required';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!eventData.case_id || !eventData.event_type || !eventData.event_title) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const eventResponse = await eventAPI.createEvent(eventData.case_id, eventData);
      
      // Create reminder if dates are provided
      if (reminderData.send_date && reminderData.send_time) {
        await eventAPI.createReminder(eventResponse.data.event.id, reminderData);
      }
      
      toast.success('Event created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <h1>Add Event</h1>
          <p>Schedule a new case event</p>
        </div>

        <div className="add-event-layout">
          <div className="case-list-panel">
            <h2>Select Case</h2>
            <div className="case-list">
              {cases.map((caseItem) => (
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
                  <span className={`badge badge-${caseItem.status}`}>
                    {caseItem.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="event-form-panel">
            {!selectedCase ? (
              <div className="empty-state">
                <p>← Select a case from the left to add an event</p>
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

                  <div className="form-group">
                    <label htmlFor="google_drive_url">Google Drive URL</label>
                    <input
                      type="url"
                      id="google_drive_url"
                      name="google_drive_url"
                      value={eventData.google_drive_url}
                      onChange={handleInputChange}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h2>Reminder Settings</h2>
                  
                  <div className="reminder-method-info">
                    <p><strong>Auto-selected Reminder Method:</strong></p>
                    <span className="badge badge-info">{getReminderMethod()}</span>
                    <p className="help-text">
                      Based on beneficiary preferences: 
                      Smartphone: {selectedCase.has_smartphone ? 'Yes' : 'No'}, 
                      Can Read: {selectedCase.can_read ? 'Yes' : 'No'}
                    </p>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="send_date">Send Reminder On</label>
                      <input
                        type="date"
                        id="send_date"
                        name="send_date"
                        value={reminderData.send_date}
                        onChange={handleReminderChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="send_time">At Time</label>
                      <input
                        type="time"
                        id="send_time"
                        name="send_time"
                        value={reminderData.send_time}
                        onChange={handleReminderChange}
                      />
                    </div>
                  </div>
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
