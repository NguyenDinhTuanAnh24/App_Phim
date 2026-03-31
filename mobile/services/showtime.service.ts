import api from './api';
import type { Seat, ShowtimeSlot } from '@/constants/types';

export interface ShowtimeSeatsResponse {
  showtime: ShowtimeSlot;
  room: {
    name: string;
    type: string;
    totalRows: number;
    totalCols: number;
  };
  cinema: {
    name: string;
    address: string;
  };
  movie: {
    title: string;
    posterUrl: string;
  };
  seats: Seat[];
  summary: {
    total: number;
    available: number;
    booked: number;
    locked: number;
  };
}

export const showtimeService = {
  // Lấy chi tiết suất chiếu
  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: ShowtimeSlot }>(`/showtimes/${id}`);
    return response.data.data;
  },

  // Lấy danh sách ghế và thông tin suất chiếu từ database
  getSeats: async (showtimeId: string) => {
    const response = await api.get<{ success: boolean; data: ShowtimeSeatsResponse }>(`/showtimes/${showtimeId}/seats`);
    return response.data.data;
  },

  // Tìm suất chiếu khả dụng
  getAvailableByMovieAndCinema: async (movieId: string, cinemaId: string, date: string) => {
    const response = await api.get<{ success: boolean; data: ShowtimeSlot[] }>('/showtimes', {
      params: { movieId, cinemaId, date }
    });
    return response.data.data;
  },
};
