import api from './api';

export const supportService = {
  createTicket: (payload: { category: string; subject: string; message: string }) =>
    api.post('/support', payload),
  getMyTickets: () => api.get('/support'),
  getTicketById: (id: string) => api.get(`/support/${id}`),
};