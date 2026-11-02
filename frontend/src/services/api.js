import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth APIs
export const authApi = {
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  customerLogin: (credentials) => api.post('/auth/customer/login', credentials),
  customerRegister: (data) => api.post('/auth/customer/register', data),
  getMe: () => api.get('/auth/me'),
  updateAdminProfile: (data) => api.put('/auth/admin/profile', data),
};

// Category APIs
export const categoriesApi = {
  getAll: (all = false) => api.get(`/categories${all ? '?all=true' : ''}`),
  create: (formData) => api.post('/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id, params = {}) => api.delete(`/categories/${id}`, { params }),
};

// Product APIs
export const productsApi = {
  getAll: (params = {}) => api.get('/products', { params }),
  getByIdOrSlug: (idOrSlug) => api.get(`/products/${idOrSlug}`),
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  toggleStatus: (id) => api.patch(`/products/${id}/toggle-status`),
  toggleFeatured: (id) => api.patch(`/products/${id}/toggle-featured`),
  delete: (id) => api.delete(`/products/${id}`),
};

// Delivery APIs
export const deliveryApi = {
  getSettings: () => api.get('/delivery-settings'),
  calculateDelivery: (data) => api.post('/delivery-settings/calculate', data),
  updateSettings: (data) => api.put('/delivery-settings', data),
  getPincodes: () => api.get('/delivery-settings/pincodes'),
  addPincode: (data) => api.post('/delivery-settings/pincodes', data),
  updatePincode: (id, data) => api.put(`/delivery-settings/pincodes/${id}`, data),
  deletePincode: (id) => api.delete(`/delivery-settings/pincodes/${id}`),
};

// Coupon APIs
export const couponsApi = {
  verify: (data) => api.post('/coupons/verify', data),
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

// Order APIs
export const ordersApi = {
  create: (data) => api.post('/orders', data),
  track: (orderNumber) => api.get(`/orders/track/${encodeURIComponent(orderNumber)}`),
  getMyOrders: () => api.get('/orders/my-orders'),
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { order_status: status }),
  updatePaymentStatus: (id, status) => api.patch(`/orders/${id}/payment-status`, { payment_status: status }),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
};

// Shop Settings APIs
export const shopApi = {
  getSettings: () => api.get('/shop-settings'),
  updateSettings: (formData) => api.put('/shop-settings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Customers APIs
export const customersApi = {
  getAll: () => api.get('/customers'),
  getAddresses: () => api.get('/customers/addresses'),
  addAddress: (data) => api.post('/customers/addresses', data),
  deleteAddress: (id) => api.delete(`/customers/addresses/${id}`),
};

// Reports APIs
export const reportsApi = {
  getDashboard: () => api.get('/reports/dashboard'),
  getSales: (params = {}) => api.get('/reports/sales', { params }),
};

export default api;
