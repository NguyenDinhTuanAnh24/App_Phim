import { useQuery } from '@tanstack/react-query';
import { cinemaService } from '@/services/cinema.service';

export const useCinemas = (params?: { city?: string; movieId?: string }) =>
  useQuery({
    queryKey: ['cinemas', params],
    queryFn: async () => (await cinemaService.getCinemas(params)).data,
    staleTime: 10 * 60 * 1000,
  });

export const useCinemaShowtimes = (
  cinemaId?: string,
  movieId?: string,
  date?: string
) =>
  useQuery({
    queryKey: ['cinemas', 'showtimes', cinemaId, movieId, date],
    queryFn: async () =>
      (await cinemaService.getCinemaShowtimes(cinemaId as string, movieId as string, date as string)).data,
    enabled: !!cinemaId && !!movieId && !!date,
    staleTime: 2 * 60 * 1000,
  });

export const useAllCities = () =>
  useQuery({
    queryKey: ['cinemas', 'cities'],
    queryFn: async () => (await cinemaService.getAllCities()).data,
    staleTime: 60 * 60 * 1000,
  });

export const useShowtimeSeats = (showtimeId?: string) =>
  useQuery({
    queryKey: ['showtimes', 'seats', showtimeId],
    queryFn: async () => (await cinemaService.getShowtimeSeats(showtimeId as string)).data,
    enabled: !!showtimeId,
    staleTime: 0,
  });
