import { Event } from '../models/Event.js';
import { Case } from '../models/Case.js';
import { Reminder } from '../models/Reminder.js';
import { determineReminderMethod } from '../utils/sendReminder.js';

export const createEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = { ...req.body, case_id: id };

    const newEvent = await Event.create(eventData);
    
    // If case is 'active', set it to 'pending' when an event is created
    const caseData = await Case.findById(id);
    if (caseData && caseData.status === 'active') {
      await Case.update(id, { status: 'pending' });
    }
    
    res.status(201).json({ 
      message: 'Event created successfully',
      event: newEvent 
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventsByCase = async (req, res) => {
  try {
    const { id } = req.params;
    const events = await Event.getByCase(id);
    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const events = await Event.getUpcoming(days);
    res.json({ events });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventData = req.body;

    const updatedEvent = await Event.update(eventId, eventData);
    
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if all events for this case are resolved (completed or cancelled)
    const hasScheduled = await Event.hasScheduledEvents(updatedEvent.case_id);
    if (!hasScheduled) {
      // All events are resolved, set case back to 'active' if it's 'pending'
      const caseData = await Case.findById(updatedEvent.case_id);
      if (caseData && caseData.status === 'pending') {
        await Case.update(updatedEvent.case_id, { status: 'active' });
      }
    }

    res.json({ 
      message: 'Event updated successfully',
      event: updatedEvent 
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const deletedEvent = await Event.delete(eventId);
    
    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if all events for this case are resolved (completed or cancelled)
    const hasScheduled = await Event.hasScheduledEvents(deletedEvent.case_id);
    if (!hasScheduled) {
      // All events are resolved, set case back to 'active' if it's 'pending'
      const caseData = await Case.findById(deletedEvent.case_id);
      if (caseData && caseData.status === 'pending') {
        await Case.update(deletedEvent.case_id, { status: 'active' });
      }
    }

    res.json({ 
      message: 'Event deleted successfully',
      event: deletedEvent 
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const reminderData = req.body;

    // Get event details to determine reminder method
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Auto-determine reminder method based on beneficiary preferences
    const method = determineReminderMethod(event.has_smartphone, event.can_read);
    
    const reminder = await Reminder.create({
      case_event_id: id,
      send_date: reminderData.send_date,
      send_time: reminderData.send_time,
      method: method,
      status: 'pending'
    });

    res.status(201).json({ 
      message: 'Reminder created successfully',
      reminder,
      method_info: {
        selected_method: method,
        reason: `Based on beneficiary preferences: Smartphone=${event.has_smartphone}, Can Read=${event.can_read}`
      }
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUpcomingReminders = async (req, res) => {
  try {
    const reminders = await Reminder.getUpcoming();
    res.json({ reminders });
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
