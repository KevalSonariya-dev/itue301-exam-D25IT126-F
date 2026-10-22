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
};

export default api;
