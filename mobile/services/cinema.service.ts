import api from './api';

export const cinemaService = {
  getCinemas: (params?: { city?: string; movieId?: string }) => api.get('/cinemas', { params }),
  getCinemaShowtimes: (cinemaId: string, movieId: string, date: string) =>
    api.get(`/cinemas/${cinemaId}/showtimes`, { params: { movieId, date } }),
  getAllCities: () => api.get('/cinemas/cities'),
  getShowtimeSeats: (showtimeId: string) =>
    api.get(`/showtimes/${showtimeId}/seats`),
};