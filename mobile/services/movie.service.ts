import api from './api';
import type { Movie } from '@/constants/types';

interface AdvancedSearchFilters {
  minRating?: number;
  maxRating?: number;
  year?: number;
  status?: 'NOW_SHOWING' | 'COMING_SOON';
  genre?: string;
  sortBy?: 'rating' | 'releaseDate' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface SearchResponse {
  movies: Movie[];
  total: number;
  appliedFilters: Record<string, any>;
}

export const movieService = {
  // Lấy danh sách phim đang chiếu sạch từ Server
  getNowShowing: async () => {
    const response = await api.get<{ success: boolean; data: Movie[] }>('/movies/now-showing');
    return response.data.data; // Trả về trực tiếp mảng Movie[]
  },

  // Lấy danh sách phim sắp chiếu từ Server
  getComingSoon: async () => {
    const response = await api.get<{ success: boolean; data: Movie[] }>('/movies/coming-soon');
    return response.data.data;
  },

  // Lấy chi tiết phim theo ID
  getMovieById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Movie }>(`/movies/${id}`);
    return response.data.data;
  },

  // Tìm kiếm phim (cơ bản)
  searchMovies: async (query: string) => {
    const response = await api.get<{ success: boolean; data: Movie[] }>('/movies/search', {
      params: { q: query },
    });
    return response.data.data;
  },

  // Tìm kiếm phim nâng cao với filters
  searchMoviesAdvanced: async (query: string, filters?: AdvancedSearchFilters) => {
    const response = await api.get<{ success: boolean; data: SearchResponse }>('/movies/search', {
      params: { q: query, ...filters },
    });
    return response.data.data;
  },

  // Lấy gợi ý autocomplete
  getMovieSuggestions: async (query: string) => {
    const response = await api.get<{ success: boolean; data: Movie[] }>('/movies/suggestions', {
      params: { q: query },
    });
    return response.data.data;
  },

  // Lấy danh sách thể loại
  getAllGenres: async () => {
    const response = await api.get<{ success: boolean; data: string[] }>('/movies/genres');
    return response.data.data;
  },
};
