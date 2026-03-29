import { z } from 'zod';

export const createBookingSchema = z.object({
  showtimeId: z.string().min(1, "Showtime ID là bắt buộc"),
  seatIds: z.array(z.string()).min(1).max(8),
  foodItems: z.array(z.object({
    comboId: z.string(),
    quantity: z.number().min(1)
  })).optional(),
  voucherCode: z.string().optional()
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;