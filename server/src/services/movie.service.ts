import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import redisClient from '../utils/redis.util';

interface GetMoviesQuery {
  status?: 'NOW_SHOWING' | 'COMING_SOON';
  genre?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface AdvancedSearchFilters {
  minRating?: number;
  maxRating?: number;
  year?: number;
  status?: 'NOW_SHOWING' | 'COMING_SOON';
  genre?: string;
  sortBy?: 'rating' | 'releaseDate' | 'title';
  sortOrder?: 'asc' | 'desc';
}

const MOVIE_LIST_SELECT = {
  id: true,
  tmdb_id: true,
  title: true,
  original_title: true,
  overview: true,
  poster_url: true,
  backdrop_url: true,
  trailer_key: true,
  rating: true,
  duration: true,
  genres: true,
  status: true,
  release_date: true,
  language: true,
};

const mapMovieData = (movie: any) => {
  let parsedGenres = [];
  try {
    parsedGenres = Array.isArray(movie.genres) 
      ? movie.genres 
      : typeof movie.genres === 'string' 
        ? JSON.parse(movie.genres) 
        : [];
  } catch (e) {
    // Nếu không phải JSON, thử split theo dấu phẩy
    parsedGenres = typeof movie.genres === 'string' 
      ? movie.genres.split(',').map((g: string) => g.trim()) 
      : [];
  }

  return {
    id: movie.id,
    tmdbId: movie.tmdb_id,
    title: movie.title,
    originalTitle: movie.original_title,
    overview: movie.overview,
    posterUrl: movie.poster_url,
    backdropUrl: movie.backdrop_url,
    trailerKey: movie.trailer_key,
    rating: movie.rating,
    duration: movie.duration,
    genres: parsedGenres,
    status: movie.status,
    releaseDate: movie.release_date,
    language: movie.language,
  };
};

export const getMovies = async (query: GetMoviesQuery) => {
  const { status, genre, search, page = 1, limit = 10 } = query;
  const where: any = {};
  if (status) where.status = status;
  if (genre) {
    where.genres = { contains: genre };
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { original_title: { contains: search } },
    ];
  }

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      orderBy: { rating: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: MOVIE_LIST_SELECT,
    }),
    prisma.movie.count({ where }),
  ]);

  return {
    movies: movies.map(mapMovieData),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getNowShowingMovies = async () => {
  const cacheKey = 'movies:now_showing';
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const movies = await prisma.movie.findMany({
    where: { status: 'NOW_SHOWING' },
    orderBy: { rating: 'desc' },
    take: 20,
    select: MOVIE_LIST_SELECT,
  });

  const result = movies.map(mapMovieData);
  await redisClient.setEx(cacheKey, 1800, JSON.stringify(result));
  return result;
};

export const getComingSoonMovies = async () => {
  const cacheKey = 'movies:coming_soon';
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const movies = await prisma.movie.findMany({
    where: { status: 'COMING_SOON' },
    orderBy: { release_date: 'asc' },
    take: 20,
    select: MOVIE_LIST_SELECT,
  });

  const result = movies.map(mapMovieData);
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));
  return result;
};

export const getMovieById = async (id: string) => {
  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) throw new AppError('Phim không tồn tại', 404);
  return mapMovieData(movie);
};

export const searchMoviesAdvanced = async (query: string, filters: AdvancedSearchFilters) => {
  const lowerQuery = query.toLowerCase();
  const where: any = {};

  if (query && query.length >= 2) {
    where.OR = [
      { title: { contains: query } },
      { original_title: { contains: query } },
      { genres: { contains: query } },
    ];
  }

  if (filters.minRating !== undefined) where.rating = { gte: filters.minRating };
  if (filters.maxRating !== undefined) where.rating = { ...where.rating, lte: filters.maxRating };
  if (filters.status) where.status = filters.status;
  if (filters.genre) where.genres = { contains: filters.genre };
  if (filters.year) {
    where.release_date = {
      gte: new Date(filters.year, 0, 1),
      lte: new Date(filters.year, 11, 31),
    };
  }

  const movies = await prisma.movie.findMany({ where, take: 50, select: MOVIE_LIST_SELECT });
  const ranked = movies.map(m => {
    let score = 0;
    const title = m.title.toLowerCase();
    if (title === lowerQuery) score += 100;
    else if (title.startsWith(lowerQuery)) score += 50;
    else if (title.includes(lowerQuery)) score += 20;
    return { ...m, score };
  });

  ranked.sort((a, b) => b.score - a.score || b.rating - a.rating);
  return {
    movies: ranked.slice(0, 20).map(mapMovieData),
    total: ranked.length
  };
};

export const getMovieSuggestions = async (query: string) => {
  const lowerQuery = query.toLowerCase();
  const movies = await prisma.movie.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { original_title: { contains: query } },
        { genres: { contains: query } },
      ],
    },
    take: 10,
    select: MOVIE_LIST_SELECT,
  });

  const ranked = movies.map(m => {
    let score = 0;
    const title = m.title.toLowerCase();
    if (title === lowerQuery) score += 100;
    else if (title.startsWith(lowerQuery)) score += 50;
    return { ...m, score };
  });

  ranked.sort((a, b) => b.score - a.score || b.rating - a.rating);
  return ranked.slice(0, 5).map(mapMovieData);
};

export const getAllGenres = async () => {
  const movies = await prisma.movie.findMany({ select: { genres: true } });
  const genresSet = new Set<string>();
  
  movies.forEach(m => {
    let genres: string[] = [];
    try {
      genres = Array.isArray(m.genres) 
        ? m.genres 
        : typeof m.genres === 'string' 
          ? JSON.parse(m.genres) 
          : [];
    } catch (e) {
      if (typeof m.genres === 'string') {
        genres = m.genres.split(',').map((g: string) => g.trim());
      }
    }
    
    genres.forEach((g: string) => {
      if (g) genresSet.add(g);
    });
  });
  
  return Array.from(genresSet).sort();
};
