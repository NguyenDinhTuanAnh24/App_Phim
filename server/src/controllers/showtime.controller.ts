import { Request, Response, NextFunction } from 'express';
import * as showtimeService from '../services/showtime.service';

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const getShowtimeById = asyncHandler(async (req: Request, res: Response) => {
  const showtime = await showtimeService.getShowtimeById(req.params.id as string);
  res.json({ success: true, data: showtime });
});

export const getShowtimeSeats = asyncHandler(async (req: any, res: Response) => {
  // Lấy userId từ req.user nếu dùng optionalAuth middleware (sẽ implement auth middleware sau nếu cần thiết, tạm truyền null nếu không có)
  const userId = req.user?.userId;
  const seatsData = await showtimeService.getShowtimeSeats(req.params.id, userId);
  res.json({ success: true, data: seatsData });
});
