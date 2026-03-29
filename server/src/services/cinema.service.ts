import { prisma } from '../utils/prisma';
import redisClient from '../utils/redis.util';
import { AppError } from '../utils/AppError';

export const getCinemas = async (query: { city?: string; movieId?: string }) => {
  const { city, movieId } = query;

  if (movieId) {
    const showtimes = await prisma.showtime.findMany({
      where: {
        movie_id: movieId,
        start_time: { gt: new Date() },
      },
      select: { room: { select: { cinema_id: true } } },
    });

    const cinemaIds = Array.from(new Set(showtimes.map((s: any) => s.room.cinema_id)));

    return prisma.cinema.findMany({
      where: {
        id: { in: cinemaIds },
        ...(city ? { city } : {}),
      },
      select: { id: true, name: true, address: true, city: true, lat: true, lng: true, image_url: true },
    });
  }

  return prisma.cinema.findMany({
    where: city ? { city } : {},
    select: { id: true, name: true, address: true, city: true, lat: true, lng: true, image_url: true },
  });
};

export const getCinemaById = async (id: string) => {
  const cinema = await prisma.cinema.findUnique({
    where: { id },
    include: { rooms: { select: { id: true, name: true, type: true } } },
  });
  if (!cinema) throw new AppError('Rạp chiếu không tồn tại', 404);
  return cinema;
};

export const getCinemaShowtimes = async (cinemaId: string, movieId: string, dateStr: string) => {
  const date = new Date(dateStr);
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  const now = new Date();

  const showtimes = await prisma.showtime.findMany({
    where: {
      movie_id: movieId,
      room: { cinema_id: cinemaId },
      start_time: {
        gte: startOfDay,
        lte: endOfDay,
        gt: now, // không lấy suất đã qua
      },
    },
    include: {
      room: { select: { id: true, name: true, type: true, total_rows: true, total_cols: true } },
      movie: { select: { title: true, duration: true } },
    },
    orderBy: { start_time: 'asc' },
  });

  const formattedShowtimes = await Promise.all(
    showtimes.map(async (st: any) => {
      // Đếm số ghế đã đặt cho suất chiếu này
      const bookedCount = await prisma.bookingItem.count({
        where: {
          showtime_id: st.id,
          booking: { status: 'PAID' },
        },
      });

      const totalSeats = st.room.total_rows * st.room.total_cols;
      const availableSeats = totalSeats - bookedCount;

      let status = 'AVAILABLE';
      if (availableSeats === 0) status = 'SOLD_OUT';
      else if (availableSeats < totalSeats * 0.2) status = 'ALMOST_FULL';

      return {
        id: st.id,
        startTime: st.start_time,
        endTime: st.end_time,
        price: st.price,
        vipPrice: st.vip_price,
        couplePrice: st.couple_price,
        language: st.language,
        format: st.format,
        room: { id: st.room.id, name: st.room.name, type: st.room.type },
        totalSeats,
        availableSeats,
        bookedSeats: bookedCount,
        status,
      };
    })
  );

  // Group by Sáng, Chiều, Tối
  const groups = [
    { period: 'Sáng', slots: formattedShowtimes.filter((s: any) => s.startTime.getHours() < 12) },
    { period: 'Chiều', slots: formattedShowtimes.filter((s: any) => s.startTime.getHours() >= 12 && s.startTime.getHours() < 17) },
    { period: 'Tối', slots: formattedShowtimes.filter((s: any) => s.startTime.getHours() >= 17) },
  ].filter((g) => g.slots.length > 0);

  return groups;
};

export const getAllCities = async () => {
  const cacheKey = 'cities:all';
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const cinemas = await prisma.cinema.findMany({ select: { city: true }, distinct: ['city'] });
  const cities = cinemas.map((c: any) => c.city).sort();

  await redisClient.setEx(cacheKey, 86400, JSON.stringify(cities));
  return cities;
};
