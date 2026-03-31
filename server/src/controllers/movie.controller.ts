import { Request, Response, NextFunction } from 'express';
import * as movieService from '../services/movie.service';

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const getMovies = asyncHandler(async (req: Request, res: Response) => {
  const { status, genre, search, page, limit } = req.query;
  const result = await movieService.getMovies({
    status: status as any,
    genre: genre as string,
    search: search as string,
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 10,
  });
  res.json({ success: true, data: result });
});

export const getMovieById = asyncHandler(async (req: Request, res: Response) => {
  const movie = await movieService.getMovieById(req.params.id as string);
  res.json({ success: true, data: movie });
});

export const getNowShowing = asyncHandler(async (req: Request, res: Response) => {
  const movies = await movieService.getNowShowingMovies();
  res.json({ success: true, data: movies });
});

export const getComingSoon = asyncHandler(async (req: Request, res: Response) => {
  const movies = await movieService.getComingSoonMovies();
  res.json({ success: true, data: movies });
});

export const searchMovies = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  const { minRating, maxRating, year, status, genre, sortBy, sortOrder } = req.query;
  
  if (!q) {
    res.json({ success: true, data: { movies: [], total: 0, appliedFilters: {} } });
    return;
  }

  const filters = {
    minRating: minRating ? parseFloat(minRating as string) : undefined,
    maxRating: maxRating ? parseFloat(maxRating as string) : undefined,
    year: year ? parseInt(year as string) : undefined,
    status: status as 'NOW_SHOWING' | 'COMING_SOON' | undefined,
    genre: genre as string | undefined,
    sortBy: sortBy as 'rating' | 'releaseDate' | 'title' | undefined,
    sortOrder: sortOrder as 'asc' | 'desc' | undefined,
  };

  const result = await movieService.searchMoviesAdvanced(q, filters);
  res.json({ success: true, data: result });
});

export const getAllGenres = asyncHandler(async (req: Request, res: Response) => {
  const genres = await movieService.getAllGenres();
  res.json({ success: true, data: genres });
});

export const getSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  if (!q || q.length < 2) {
    res.json({ success: true, data: [] });
    return;
  }
  const suggestions = await movieService.getMovieSuggestions(q);
  res.json({ success: true, data: suggestions });
});
