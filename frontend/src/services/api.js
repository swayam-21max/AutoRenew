import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('autorenew_token') || localStorage.getItem('policypulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('autorenew_token');
      localStorage.removeItem('autorenew_user');
      localStorage.removeItem('policypulse_token');
      localStorage.removeItem('policypulse_user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Profile API
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
};

// Vehicle API
export const vehicleAPI = {
  importExcel: (formData) =>
    api.post('/vehicles/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  downloadSample: () =>
    api.get('/vehicles/sample-template', { responseType: 'blob' }),
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// Reminder API
export const reminderAPI = {
  triggerEngine: () => api.post('/reminders/trigger'),
  sendTestEmail: (data) => api.post('/reminders/test-email', data),
  getStats: () => api.get('/reminders/stats'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Health & Testing API
export const healthAPI = {
  testEmail: (data) => api.post('/health/test-email', data),
  testSMS: (data) => api.post('/health/test-sms', data),
  testWhatsApp: (data) => api.post('/health/test-whatsapp', data),
  triggerScheduler: () => api.post('/health/trigger-scheduler'),
};

export default api;
