import api from './api';

export const bookingService = {
  getFoodCombos: () => api.get('/bookings/food-combos'),
  createBooking: (payload: {
    showtimeId: string;
    seatIds: string[];
    foodItems?: Array<{ comboId: string; quantity: number }>;
    voucherCode?: string;
  }) => api.post('/bookings', payload),
  createPaymentUrl: (bookingId: string) =>
    api.post(`/bookings/${bookingId}/payment-url`),
  getBookingById: (id: string) => api.get(`/bookings/${id}`),
  getUserBookings: (status?: string) =>
    api.get('/bookings/my', { params: { status } }),
};