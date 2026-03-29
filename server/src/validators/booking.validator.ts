import { z } from 'zod';

export const createBookingSchema = z.object({
  showtimeId: z.string().min(1, 'showtimeId là bắt buộc'),
  seatIds: z.array(z.string()).min(1, 'Phải chọn ít nhất 1 ghế').max(8, 'Chỉ được chọn tối đa 8 ghế'),
  foodItems: z.array(
    z.object({
      comboId: z.string(),
      quantity: z.number().int().min(1, 'Số lượng phải >= 1'),
    })
  ).optional().default([]),
  voucherCode: z.string().optional(),
});
