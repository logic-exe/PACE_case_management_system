import api from './api';

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me')
};

// Beneficiary API
export const beneficiaryAPI = {
  getAll: () => api.get('/beneficiaries'),
  getById: (id) => api.get(`/beneficiaries/${id}`),
  create: (data) => api.post('/beneficiaries', data),
  update: (id, data) => api.put(`/beneficiaries/${id}`, data),
  delete: (id) => api.delete(`/beneficiaries/${id}`)
};

// Case API
export const caseAPI = {
  getAll: () => api.get('/cases'),
  getOngoing: () => api.get('/cases/ongoing'),
  getWithFilters: (filters) => api.get('/cases/filter', { params: filters }),
  getById: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.put(`/cases/${id}`, data),
  delete: (id) => api.delete(`/cases/${id}`)
};

// Event API
export const eventAPI = {
  getUpcoming: (days = 7) => api.get('/events/upcoming', { params: { days } }),
  createEvent: (caseId, data) => api.post(`/events/cases/${caseId}/events`, data),
  getEventsByCase: (caseId) => api.get(`/events/cases/${caseId}/events`),
  updateEvent: (eventId, data) => api.put(`/events/${eventId}`, data),
  createReminder: (eventId, data) => api.post(`/events/${eventId}/reminders`, data),
  getUpcomingReminders: () => api.get('/events/reminders/upcoming')
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};
