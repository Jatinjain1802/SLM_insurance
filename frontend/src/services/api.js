// services/api.js
// LEARNING NOTE:
// Axios is a library that makes HTTP requests (like fetch but better).
// We create ONE central "axios instance" with our base URL and token.
// Every API call in the app goes through this file — so if our
// backend URL changes, we only change it here.

import axios from 'axios'

// Base URL of our backend API
// In development: http://localhost:5000
// In production: your server URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create the axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// INTERCEPTOR: Automatically attach JWT token to every request
// Before each request is sent, we grab the token from localStorage
// and add it to the Authorization header.
// The backend uses this to verify: "who is making this request?"
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('slm_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// INTERCEPTOR: Handle 401 (Unauthorized) responses globally
// If the token is expired, redirect to login automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('slm_token')
      localStorage.removeItem('slm_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ============================================================
// AUTH API CALLS
// ============================================================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
}

// ============================================================
// CUSTOMERS API CALLS
// ============================================================
export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
}

// ============================================================
// POLICIES API CALLS
// ============================================================
export const policiesAPI = {
  getAll: (params) => api.get('/policies', { params }),
  getById: (id) => api.get(`/policies/${id}`),
  getByCustomer: (customerId) => api.get(`/policies/customer/${customerId}`),
  create: (data) => api.post('/policies', data),
  update: (id, data) => api.put(`/policies/${id}`, data),
  delete: (id) => api.delete(`/policies/${id}`),
}

// ============================================================
// PREMIUMS API CALLS
// ============================================================
export const premiumsAPI = {
  getUpcoming: () => api.get('/premiums/upcoming'),
  getOverdue: () => api.get('/premiums/overdue'),
  markPaid: (id) => api.put(`/premiums/${id}/pay`),
}

// ============================================================
// INSURANCE COMPANIES API CALLS
// ============================================================
export const companiesAPI = {
  getAll: () => api.get('/companies'),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
}

// ============================================================
// DOCUMENTS API CALLS
// ============================================================
export const documentsAPI = {
  getAll: () => api.get('/documents'),
  getByCustomer: (customerId) => api.get(`/documents/customer/${customerId}`),
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/documents/${id}`),
}

// ============================================================
// DASHBOARD API CALLS
// ============================================================
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
}

// ============================================================
// REPORTS API CALLS
// ============================================================
export const reportsAPI = {
  getCustomerReport: () => api.get('/reports/customers'),
  getPolicyReport: () => api.get('/reports/policies'),
  getRevenueReport: () => api.get('/reports/revenue'),
}

// ============================================================
// NOTIFICATIONS API CALLS
// ============================================================
export const notificationsAPI = {
  sendWhatsApp: (data) => api.post('/whatsapp/send', data),
  sendSms: (data) => api.post('/sms/send', data),
  getWhatsAppLogs: () => api.get('/whatsapp/logs'),
  getSmsLogs: () => api.get('/sms/logs'),
}

export default api
