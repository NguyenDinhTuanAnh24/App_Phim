import { prisma } from '../utils/prisma';
import redisClient from '../utils/redis.util';
import { AppError } from '../utils/AppError';

export const getShowtimeById = async (id: string) => {
  const showtime = await prisma.showtime.findUnique({
    where: { id },
    include: {
      movie: { select: { title: true, poster_url: true, duration: true, rating: true } },
      room: {
        select: {
          name: true,
          type: true,
          total_rows: true,
          total_cols: true,
          cinema: { select: { name: true, address: true, city: true } },
        },
      },
    },
  });

  if (!showtime) throw new AppError('Suất chiếu không tồn tại', 404);
  return showtime;
};

export const getShowtimeSeats = async (showtimeId: string, userId?: string) => {
  const showtime = await getShowtimeById(showtimeId);

  // Lấy tất cả ghế của phòng chiếu này
  const seats = await prisma.seat.findMany({
    where: { room_id: showtime.room_id },
    orderBy: [{ row: 'asc' }, { col: 'asc' }],
  });

  // Lấy ghế đã đặt mua thành công ('PAID')
  const bookedSeatItems = await prisma.bookingItem.findMany({
    where: {
      showtime_id: showtimeId,
      booking: { status: 'PAID' },
    },
    select: { seat_id: true },
  });
  const bookedSeatIds = new Set(bookedSeatItems.map((item: any) => item.seat_id));

  // Lấy ghế đang trong quá trình thanh toán ('PENDING')
  const pendingSeatItems = await prisma.bookingItem.findMany({
    where: {
      showtime_id: showtimeId,
      booking: { status: 'PENDING' },
    },
    select: { seat_id: true },
  });
  const pendingSeatIds = new Set(pendingSeatItems.map((item: any) => item.seat_id));

  // Lấy ghế đang bị lock trong Redis (đang chọn nhưng chưa tạo booking PENDING)
  // Redis keys pattern: "seat:{showtimeId}:*"
  const pattern = `seat:${showtimeId}:*`;
  const keys = await redisClient.keys(pattern);
  const lockedSeats = new Map<string, string>(); // seatId -> userId

  if (keys.length > 0) {
    const values = await redisClient.mGet(keys);
    keys.forEach((key, index) => {
      const seatId = key.split(':')[2];
      const lockedBy = values[index];
      if (lockedBy) lockedSeats.set(seatId, lockedBy);
    });
  }

  // Xác định trạng thái của từng ghế
  let available = 0;
  let booked = 0;
  let locked = 0;

  const seatsData = seats.map((seat: any) => {
    let status = 'AVAILABLE';
    let price = showtime.price;

    if (seat.type === 'VIP') price = showtime.vip_price;
    else if (seat.type === 'COUPLE') price = showtime.couple_price;

    if (seat.type === 'DISABLED') {
      status = 'DISABLED';
    } else if (bookedSeatIds.has(seat.id) || pendingSeatIds.has(seat.id)) {
      status = 'BOOKED';
      booked++;
    } else if (lockedSeats.has(seat.id)) {
      const lockedBy = lockedSeats.get(seat.id);
      if (userId && lockedBy === userId) {
        status = 'SELECTED'; // Ghế do chính user đang thao tác giữ
      } else {
        status = 'LOCKED'; // Ghế do người khác đang giữ
        locked++;
      }
    } else {
      available++;
    }

    return {
      id: seat.id,
      row: seat.row,
      col: seat.col,
      type: seat.type,
      status,
      price,
    };
  });

  return {
    showtime: {
      id: showtime.id,
      startTime: showtime.start_time,
      endTime: showtime.end_time,
      price: showtime.price,
      vipPrice: showtime.vip_price,
      couplePrice: showtime.couple_price,
      format: showtime.format,
      language: showtime.language,
    },
    room: {
      name: showtime.room.name,
      type: showtime.room.type,
      totalRows: showtime.room.total_rows,
      totalCols: showtime.room.total_cols,
    },
    cinema: {
      name: showtime.room.cinema.name,
      address: showtime.room.cinema.address,
    },
    movie: {
      title: showtime.movie.title,
      posterUrl: showtime.movie.poster_url,
    },
    seats: seatsData,
    summary: {
      total: seats.length,
      available,
      booked,
      locked,
    },
  };
};
