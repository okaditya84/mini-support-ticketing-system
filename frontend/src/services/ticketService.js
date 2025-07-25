import api from './api';

export const ticketService = {
  // Get all tickets with optional filters
  getTickets: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/tickets?${params.toString()}`);
  },

  // Create a new ticket
  createTicket: (ticketData) => {
    return api.post('/tickets', ticketData);
  },

  // Update an existing ticket
  updateTicket: (ticketId, updateData) => {
    return api.put(`/tickets/${ticketId}`, updateData);
  },

  // Analyze ticket with AI
  analyzeTicket: (ticketId) => {
    return api.post(`/tickets/${ticketId}/analyze`);
  },

  // Get dashboard statistics
  getStats: () => {
    return api.get('/stats');
  },

  // Get all users
  getUsers: () => {
    return api.get('/users');
  },

  // Health check
  healthCheck: () => {
    return api.get('/health');
  }
};

export default ticketService;
