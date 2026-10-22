import axios from 'axios';

// Configure base URL (direct backend URL with proxy fallback)
const API_BASE_URL = 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Attach token dynamically to every request if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventhub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // --- Auth Endpoints ---
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  // --- Events Endpoints ---
  getEvents: async (category) => {
    const params = category ? { category } : {};
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  getEventById: async (id) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  // --- Tickets Endpoints ---
  bookTicket: async (eventId, quantity) => {
    const response = await apiClient.post('/tickets', { eventId, quantity });
    return response.data;
  },

  getMyTickets: async () => {
    const response = await apiClient.get('/tickets/my');
    return response.data;
  },

  updateTicketStatus: async (ticketId, status) => {
    const response = await apiClient.patch(`/tickets/${ticketId}/status`, { status });
    return response.data;
  },

  // --- Admin Endpoints ---
  getAdminStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getAdminEvents: async () => {
    const response = await apiClient.get('/admin/events');
    return response.data;
  },

  createAdminEvent: async (eventData) => {
    const response = await apiClient.post('/admin/events', eventData);
    return response.data;
  },

  updateAdminEvent: async (id, eventData) => {
    const response = await apiClient.put(`/admin/events/${id}`, eventData);
    return response.data;
  },

  deleteAdminEvent: async (id) => {
    const response = await apiClient.delete(`/admin/events/${id}`);
    return response.data;
  },

  getAdminBookings: async (params = {}) => {
    const response = await apiClient.get('/admin/bookings', { params });
    return response.data;
  },

  updateAdminBookingStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/bookings/${id}/status`, { status });
    return response.data;
  },

  getAdminAttendees: async (search) => {
    const params = search ? { search } : {};
    const response = await apiClient.get('/admin/attendees', { params });
    return response.data;
  },

  getAdminAttendeeById: async (id) => {
    const response = await apiClient.get(`/admin/attendees/${id}`);
    return response.data;
  },
};

export default api;
