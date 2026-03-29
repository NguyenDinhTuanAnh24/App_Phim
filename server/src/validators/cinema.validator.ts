import { z } from 'zod';

export const getCinemasSchema = z.object({
  query: z.object({
    city: z.string().optional(),
    movieId: z.string().optional(),
  }),
});

export const getCinemaShowtimesSchema = z.object({
  query: z.object({
    movieId: z.string().min(1, 'movieId là bắt buộc'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date phải có format YYYY-MM-DD').refine(dateStr => {
      const selected = new Date(dateStr);
      selected.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, 'Không được chọn ngày trong quá khứ'),
  }),
  params: z.object({
    id: z.string().min(1, 'cinemaId là bắt buộc'),
  }),
});

export const getShowtimeSeatsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'showtimeId là bắt buộc'),
  }),
});
