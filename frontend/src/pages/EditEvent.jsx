import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { eventAPI } from '../services/apiService';
import toast from 'react-hot-toast';

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('caseId');
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    event_type: '',
    event_title: '',
    event_date: '',
    event_time: '',
    location: '',
    description: '',
    event_status: 'scheduled'
  });

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await eventAPI.getById(eventId);
      const eventData = response.data.event;
      setEvent(eventData);
      setFormData({
        event_type: eventData.event_type || '',
        event_title: eventData.event_title || '',
        event_date: eventData.event_date ? eventData.event_date.split('T')[0] : '',
        event_time: eventData.event_time || '',
        location: eventData.location || '',
        description: eventData.description || '',
        event_status: eventData.event_status || 'scheduled'
      });
    } catch (error) {
      toast.error('Failed to load event details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await eventAPI.updateEvent(eventId, formData);
      toast.success('Event updated successfully');
      navigate(caseId ? `/cases/${caseId}` : -1);
    } catch (error) {
      toast.error('Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Event not found</p>
          <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-with-back">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back
        </button>
        <div>
          <h1>Edit Event</h1>
          <p>Update event details for {event.case_code}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event_type">Event Type *</label>
              <select
                id="event_type"
                name="event_type"
                value={formData.event_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select event type</option>
                <option value="Court Hearing">Court Hearing</option>
                <option value="Counseling Session">Counseling Session</option>
                <option value="Mediation Meeting">Mediation Meeting</option>
                <option value="Document Submission">Document Submission</option>
                <option value="Follow-up Call">Follow-up Call</option>
                <option value="Legal Consultation">Legal Consultation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="event_status">Event Status *</label>
              <select
                id="event_status"
                name="event_status"
                value={formData.event_status}
                onChange={handleInputChange}
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="event_title">Event Title *</label>
            <input
              type="text"
              id="event_title"
              name="event_title"
              value={formData.event_title}
              onChange={handleInputChange}
              placeholder="e.g., Initial hearing for domestic violence case"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event_date">Event Date *</label>
              <input
                type="date"
                id="event_date"
                name="event_date"
                value={formData.event_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="event_time">Event Time</label>
              <input
                type="time"
                id="event_time"
                name="event_time"
                value={formData.event_time}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Family Court Room 1, District Court Delhi"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description/Notes</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Additional details about the event..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;