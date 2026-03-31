import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '@/services/movie.service';

const useDebounced = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export const useNowShowing = () =>
  useQuery({
    queryKey: ['movies', 'now-showing'],
    queryFn: async () => movieService.getNowShowing(),
    staleTime: 5 * 60 * 1000,
  });

export const useComingSoon = () =>
  useQuery({
    queryKey: ['movies', 'coming-soon'],
    queryFn: async () => movieService.getComingSoon(),
    staleTime: 10 * 60 * 1000,
  });

export const useMovieDetail = (id?: string) =>
  useQuery({
    queryKey: ['movies', 'detail', id],
    queryFn: async () => movieService.getMovieById(id as string),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

export const useSearchMovies = (query: string) => {
  const debounced = useDebounced(query, 500);
  return useQuery({
    queryKey: ['movies', 'search', debounced],
    queryFn: async () => movieService.searchMovies(debounced),
    enabled: debounced.trim().length >= 1,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAllGenres = () =>
  useQuery({
    queryKey: ['movies', 'genres'],
    queryFn: async () => movieService.getAllGenres(),
    staleTime: 30 * 60 * 1000,
  });
