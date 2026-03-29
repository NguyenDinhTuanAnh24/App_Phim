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

const MOVIE_LIST_SELECT = {
  id: true,
  tmdb_id: true,
  title: true,
  original_title: true,
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

export const getMovies = async (query: GetMoviesQuery) => {
  const { status, genre, search, page = 1, limit = 10 } = query;

  const where: any = {};

  if (status) where.status = status;

  if (genre) {
    // genres is stored as JSON array, use string_contains for MySQL JSON
    where.genres = { string_contains: genre };
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

  const totalPages = Math.ceil(total / limit);

  return {
    movies,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

export const getMovieById = async (id: string) => {
  // Check cache
  const cacheKey = `movie:${id}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) throw new AppError('Phim không tồn tại', 404);

  // Cache for 30 minutes
  await redisClient.setEx(cacheKey, 1800, JSON.stringify(movie));

  return movie;
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

  await redisClient.setEx(cacheKey, 1800, JSON.stringify(movies));
  return movies;
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

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(movies));
  return movies;
};

export const searchMovies = async (query: string) => {
  const movies = await prisma.movie.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { original_title: { contains: query } },
      ],
    },
    take: 20,
    select: MOVIE_LIST_SELECT,
  });
  return movies;
};

export const getAllGenres = async () => {
  const cacheKey = 'genres:all';
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const movies = await prisma.movie.findMany({ select: { genres: true } });
  const genresSet = new Set<string>();

  movies.forEach((m) => {
    const parsed = Array.isArray(m.genres)
      ? m.genres
      : typeof m.genres === 'string'
      ? JSON.parse(m.genres)
      : [];
    parsed.forEach((g: string) => genresSet.add(g));
  });

  const genres = Array.from(genresSet).sort();

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(genres));
  return genres;
};
