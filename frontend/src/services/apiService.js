import api from './api';

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  getGoogleAuthUrl: () => api.get('/auth/google/url'),
  handleGoogleCallback: (code) => api.get(`/auth/google/callback`, { params: { code } })
};

// Beneficiary API
export const beneficiaryAPI = {
  getAll: () => api.get('/beneficiaries'),
  getById: (id) => api.get(`/beneficiaries/${id}`),
  findByNameAndPhone: (name, phone) => api.get('/beneficiaries/find', { params: { name, phone } }),
  create: (data) => api.post('/beneficiaries', data),
  update: (id, data) => api.put(`/beneficiaries/${id}`, data),
  delete: (id) => api.delete(`/beneficiaries/${id}`)
};

// Case API
export const caseAPI = {
  getAll: (dateFilter) => api.get('/cases', { params: dateFilter ? { dateFilter } : {} }),
  getOngoing: (dateFilter) => api.get('/cases/ongoing', { params: dateFilter ? { dateFilter } : {} }),
  getWithFilters: (filters) => api.get('/cases/filter', { params: filters }),
  getById: (id) => api.get(`/cases/${id}`),
  create: (data, driveToken) => {
    return api.post('/cases', data, {
      headers: driveToken ? { 'X-Drive-Access-Token': driveToken } : {}
    });
  },
  update: (id, data) => api.put(`/cases/${id}`, data),
  delete: (id) => api.delete(`/cases/${id}`)
};

// Event API
export const eventAPI = {
  getUpcoming: (days = 7) => api.get('/events/upcoming', { params: { days } }),
  createEvent: (caseId, data) => api.post(`/events/cases/${caseId}/events`, data),
  getByCaseId: (caseId) => api.get(`/events/cases/${caseId}/events`),
  getEventsByCase: (caseId) => api.get(`/events/cases/${caseId}/events`), // Alias for compatibility
  getById: (eventId) => api.get(`/events/${eventId}`),
  updateEvent: (eventId, data) => api.put(`/events/${eventId}`, data),
  deleteEvent: (eventId) => api.delete(`/events/${eventId}`),
  createReminder: (eventId, data) => api.post(`/events/${eventId}/reminders`, data),
  getUpcomingReminders: () => api.get('/events/reminders/upcoming')
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};

// Document API
export const documentAPI = {
  upload: (caseId, formData, driveToken) => {
    return api.post(`/documents/cases/${caseId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Drive-Access-Token': driveToken
      }
    });
  },
  getByCase: (caseId, category) => {
    const params = category ? { category } : {};
    return api.get(`/documents/cases/${caseId}`, { params });
  },
  getById: (id) => api.get(`/documents/${id}`),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id, driveToken) => {
    return api.delete(`/documents/${id}`, {
      headers: {
        'X-Drive-Access-Token': driveToken
      }
    });
  }
};
