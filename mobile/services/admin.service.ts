import api from './api';

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRevenueChart: (period: string) => api.get('/admin/dashboard/revenue', { params: { period } }),
  getRecentBookings: () => api.get('/admin/dashboard/recent-bookings'),

  getBookings: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/admin/bookings', { params }),
  getBookingDetail: (id: string) => api.get(`/admin/bookings/${id}`),
  updateBookingStatus: (id: string, status: string) =>
    api.patch(`/admin/bookings/${id}/status`, { status }),

  getMovies: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/admin/movies', { params }),
  getMovieSuggestions: (q: string) => api.get('/admin/movies/suggestions', { params: { q } }),
  getMovieDetail: (id: string) => api.get(`/admin/movies/${id}`),
  createMovie: (data: unknown) => api.post('/admin/movies', data),
  updateMovie: (id: string, data: unknown) => api.put(`/admin/movies/${id}`, data),
  deleteMovie: (id: string) => api.delete(`/admin/movies/${id}`),

  createShowtime: (data: unknown) => api.post('/admin/showtimes', data),
  updateShowtime: (id: string, data: unknown) => api.put(`/admin/showtimes/${id}`, data),
  deleteShowtime: (id: string) => api.delete(`/admin/showtimes/${id}`),

  getUsers: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get('/admin/users', { params }),
  getUserSuggestions: (q: string) => api.get('/admin/users/suggestions', { params: { q } }),
  getUserDetail: (id: string) => api.get(`/admin/users/${id}`),
  banUser: (id: string, reason: string) => api.patch(`/admin/users/${id}/ban`, { reason }),

  getAllTickets: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/admin/support', { params }),
  getTicketDetail: (id: string) => api.get(`/admin/support/${id}`),
  replyTicket: (id: string, reply: string) => api.patch(`/admin/support/${id}/reply`, { reply }),
};
