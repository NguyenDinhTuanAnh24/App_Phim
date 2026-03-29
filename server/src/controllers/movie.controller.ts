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
  if (!q) {
    res.json({ success: true, data: [] });
    return;
  }
  const movies = await movieService.searchMovies(q);
  res.json({ success: true, data: movies });
});

export const getAllGenres = asyncHandler(async (req: Request, res: Response) => {
  const genres = await movieService.getAllGenres();
  res.json({ success: true, data: genres });
});
