import express from 'express';
import {
  createEvent,
  getEventsByCase,
  getUpcomingEvents,
  updateEvent,
  createReminder,
  getUpcomingReminders
} from '../controllers/eventController.js';

const router = express.Router();

// Public routes (authentication disabled)
router.get('/upcoming', getUpcomingEvents);
router.post('/cases/:id/events', createEvent);
router.get('/cases/:id/events', getEventsByCase);
router.put('/:eventId', updateEvent);
router.post('/:id/reminders', createReminder);
router.get('/reminders/upcoming', getUpcomingReminders);

export default router;
