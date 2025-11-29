import express from 'express';
import {
  createEvent,
  getEventsByCase,
  getUpcomingEvents,
  updateEvent,
  deleteEvent,
  createReminder,
  getUpcomingReminders,
  getEventById
} from '../controllers/eventController.js';

const router = express.Router();

// Public routes (authentication disabled)
// Specific routes MUST come before parameterized routes
router.get('/upcoming', getUpcomingEvents);
router.get('/reminders/upcoming', getUpcomingReminders);
router.post('/cases/:id/events', createEvent);
router.get('/cases/:id/events', getEventsByCase);
// Parameterized routes LAST
router.get('/:eventId', getEventById);
router.put('/:eventId', updateEvent);
router.delete('/:eventId', deleteEvent);
router.post('/:id/reminders', createReminder);

export default router;
