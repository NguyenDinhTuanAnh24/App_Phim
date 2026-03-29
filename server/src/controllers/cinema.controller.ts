import { Request, Response, NextFunction } from 'express';
import * as cinemaService from '../services/cinema.service';

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const getCinemas = asyncHandler(async (req: Request, res: Response) => {
  const { city, movieId } = req.query;
  const cinemas = await cinemaService.getCinemas({
    city: city as string,
    movieId: movieId as string,
  });
  res.json({ success: true, data: cinemas });
});

export const getCinemaById = asyncHandler(async (req: Request, res: Response) => {
  const cinema = await cinemaService.getCinemaById(req.params.id as string);
  res.json({ success: true, data: cinema });
});

export const getCinemaShowtimes = asyncHandler(async (req: Request, res: Response) => {
  const { movieId, date } = req.query;
  const { id } = req.params;

  const showtimes = await cinemaService.getCinemaShowtimes(
    id as string,
    movieId as string,
    date as string
  );
  res.json({ success: true, data: showtimes });
});

export const getAllCities = asyncHandler(async (req: Request, res: Response) => {
  const cities = await cinemaService.getAllCities();
  res.json({ success: true, data: cities });
});
