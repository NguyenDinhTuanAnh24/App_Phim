import { prisma } from '../utils/prisma';
import dayjs from 'dayjs';
import { AppError } from '../utils/AppError';
import * as emailService from './email.service';

export const getDashboardStats = async () => {
  const today = dayjs().startOf('day').toDate();
  const yesterday = dayjs().subtract(1, 'day').startOf('day').toDate();

  const [todayStats, yesterdayStats, totals] = await Promise.all([
    prisma.booking.aggregate({
      where: { status: 'PAID', paid_at: { gte: today } },
      _sum: { total_amount: true },
      _count: { id: true },
    }),
    prisma.booking.aggregate({
      where: { status: 'PAID', paid_at: { gte: yesterday, lt: today } },
      _sum: { total_amount: true },
      _count: { id: true },
    }),
    prisma.$transaction([
      prisma.booking.aggregate({
        where: { status: 'PAID' },
        _sum: { total_amount: true },
        _count: { id: true },
      }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.movie.count({ where: { status: 'NOW_SHOWING' } }),
    ])
  ]);

  const todayRevenue = todayStats._sum.total_amount || 0;
  const yesterdayRevenue = yesterdayStats._sum.total_amount || 0;
  const todayBookings = todayStats._count.id || 0;
  const yesterdayBookings = yesterdayStats._count.id || 0;

  // Growth phản ánh thực tế: nếu hôm qua bằng 0 thì không ép 100%
  const revenueGrowth = yesterdayRevenue > 0
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
    : 0;
  const bookingsGrowth = yesterdayBookings > 0
    ? ((todayBookings - yesterdayBookings) / yesterdayBookings) * 100
    : 0;

  // For tickets sold today, we need to sum up booking items
  const ticketsSoldToday = await prisma.bookingItem.count({
    where: { booking: { status: 'PAID', paid_at: { gte: today } } }
  });

  return {
    today: {
      revenue: todayRevenue,
      bookings: todayBookings,
      tickets_sold: ticketsSoldToday,
    },
    total: {
      revenue: totals[0]._sum.total_amount || 0,
      bookings: totals[0]._count.id || 0,
      users: totals[1],
      movies: totals[2],
    },
    growth: {
      revenue_vs_yesterday: Math.round(revenueGrowth * 10) / 10,
      bookings_vs_yesterday: Math.round(bookingsGrowth * 10) / 10,
    }
  };
};

export const getRevenueChart = async (period: '7d' | '30d' | '12m') => {
  let days = 7;
  let format = '%d/%m';
  let unit: dayjs.ManipulateType = 'day';

  if (period === '30d') days = 30;
  if (period === '12m') {
    days = 12;
    format = '%m/%Y';
    unit = 'month';
  }

  const startDate = dayjs().subtract(days - 1, unit).startOf(unit).toDate();

  // Prisma doesn't support grouping by date part easily across all providers without queryRaw
  // For MySQL:
  const query = period === '12m' 
    ? `SELECT DATE_FORMAT(paid_at, '%m/%Y') as date, SUM(total_amount) as revenue, COUNT(id) as bookings 
       FROM bookings 
       WHERE status = 'PAID' AND paid_at >= ? 
       GROUP BY DATE_FORMAT(paid_at, '%m/%Y')
       ORDER BY paid_at ASC`
    : `SELECT DATE_FORMAT(paid_at, '%d/%m') as date, SUM(total_amount) as revenue, COUNT(id) as bookings 
       FROM bookings 
       WHERE status = 'PAID' AND paid_at >= ? 
       GROUP BY DATE_FORMAT(paid_at, '%d/%m')
       ORDER BY paid_at ASC`;

  const results: any[] = await prisma.$queryRawUnsafe(query, startDate);

  return results.map(r => ({
    date: r.date,
    revenue: Number(r.revenue),
    bookings: Number(r.bookings)
  }));
};

export const getRecentBookings = async () => {
    return prisma.booking.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
            user: { select: { name: true, email: true } },
            showtime: {
                include: {
                    movie: { select: { title: true } }
                }
            }
        }
    });
};

export const getAdminBookings = async (query: { status?: any, search?: string, page?: number, limit?: number }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) {
        where.OR = [
            { id: { contains: query.search } },
            { user: { name: { contains: query.search } } },
            { user: { email: { contains: query.search } } },
            { showtime: { movie: { title: { contains: query.search } } } }
        ];
    }

    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                showtime: {
                    include: {
                        movie: { select: { title: true, poster_url: true } },
                        room: {
                            include: { cinema: { select: { name: true } } }
                        }
                    }
                },
                payment: true
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        }),
        prisma.booking.count({ where })
    ]);

    return {
        bookings,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const getAdminBookingDetail = async (id: string) => {
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            showtime: {
                include: {
                    movie: true,
                    room: {
                        include: { cinema: true }
                    }
                }
            },
            booking_items: {
                include: { seat: true }
            },
            food_items: {
                include: { combo: true }
            },
            payment: true
        }
    });

    if (!booking) throw new AppError('Không tìm thấy đơn hàng', 404);
    return booking;
};

export const updateBookingStatus = async (id: string, status: any) => {
    return prisma.booking.update({
        where: { id },
        data: { 
            status,
            ...(status === 'PAID' ? { paid_at: new Date() } : {})
        }
    });
};

export const getAdminMovies = async (query: { search?: string, page?: number, limit?: number }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
        where.OR = [
            { title: { contains: query.search } },
            { original_title: { contains: query.search } }
        ];
    }

    const [movies, total] = await Promise.all([
        prisma.movie.findMany({
            where,
            orderBy: { release_date: 'desc' },
            skip,
            take: limit
        }),
        prisma.movie.count({ where })
    ]);

    return {
        movies,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const getAdminMovieSuggestions = async (query: string) => {
    const keyword = query.trim();
    if (!keyword) return [];

    return prisma.movie.findMany({
        where: {
            OR: [
                { title: { contains: keyword } },
                { original_title: { contains: keyword } },
            ],
        },
        select: {
            id: true,
            title: true,
            original_title: true,
            status: true,
            release_date: true,
        },
        orderBy: { release_date: 'desc' },
        take: 8,
    });
};

export const getAdminMovieDetail = async (id: string) => {
    const movie = await prisma.movie.findUnique({
        where: { id }
    });

    if (!movie) {
        throw new AppError('Không tìm thấy phim', 404);
    }

    return movie;
};

export const createMovie = async (data: any) => {
    if (!data?.title?.trim()) {
        throw new AppError('Tiêu đề phim là bắt buộc', 400);
    }

    const now = Date.now();
    const normalizedData = {
        tmdb_id: Number(data.tmdb_id ?? now),
        title: data.title.trim(),
        original_title: data.original_title?.trim() || data.title.trim(),
        overview: data.overview?.trim() || 'Đang cập nhật nội dung phim.',
        poster_url: data.poster_url || 'https://via.placeholder.com/500x750?text=Movie',
        backdrop_url: data.backdrop_url || 'https://via.placeholder.com/1280x720?text=Backdrop',
        trailer_key: data.trailer_key || null,
        genres: typeof data.genres === 'string' ? data.genres : JSON.stringify(data.genres || []),
        cast: typeof data.cast === 'string' ? data.cast : JSON.stringify(data.cast || []),
        director: data.director || 'Đang cập nhật',
        duration: Number(data.duration ?? 120),
        rating: Number(data.rating ?? 8),
        language: data.language || 'vi',
        status: data.status || 'COMING_SOON',
        release_date: data.release_date ? new Date(data.release_date) : new Date(),
    };

    return prisma.movie.create({ data: normalizedData });
};

export const updateMovie = async (id: string, data: any) => {
    const mappedData: any = {
        ...(data.title ? { title: data.title.trim() } : {}),
        ...(data.original_title ? { original_title: data.original_title.trim() } : {}),
        ...(data.overview ? { overview: data.overview.trim() } : {}),
        ...(data.poster_url ? { poster_url: data.poster_url } : {}),
        ...(data.backdrop_url ? { backdrop_url: data.backdrop_url } : {}),
        ...(data.trailer_key !== undefined ? { trailer_key: data.trailer_key } : {}),
        ...(data.genres ? { genres: typeof data.genres === 'string' ? data.genres : JSON.stringify(data.genres) } : {}),
        ...(data.cast ? { cast: typeof data.cast === 'string' ? data.cast : JSON.stringify(data.cast) } : {}),
        ...(data.director ? { director: data.director } : {}),
        ...(data.duration !== undefined ? { duration: Number(data.duration) } : {}),
        ...(data.rating !== undefined ? { rating: Number(data.rating) } : {}),
        ...(data.language ? { language: data.language } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.release_date ? { release_date: new Date(data.release_date) } : {}),
    };

    return prisma.movie.update({
        where: { id },
        data: mappedData
    });
};

export const deleteMovie = async (id: string) => {
    // Check if has showtimes
    const showtimesCount = await prisma.showtime.count({ where: { movie_id: id } });
    if (showtimesCount > 0) {
        throw new AppError('Không thể xóa phim đã có suất chiếu. Hãy xóa các suất chiếu trước.', 400);
    }
    return prisma.movie.delete({ where: { id } });
};

export const createShowtime = async (data: any) => {
    const startTime = data.start_time || data.startTime;
    if (!startTime) throw new AppError('Thiếu thời gian bắt đầu suất chiếu', 400);

    const normalizedData = {
        movie_id: data.movie_id || data.movieId,
        room_id: data.room_id || data.roomId,
        start_time: new Date(startTime),
        end_time: new Date(data.end_time || data.endTime || new Date(new Date(startTime).getTime() + 2 * 60 * 60 * 1000)),
        price: Number(data.price ?? 90000),
        vip_price: Number(data.vip_price ?? data.vipPrice ?? 120000),
        couple_price: Number(data.couple_price ?? data.couplePrice ?? 180000),
        language: data.language || 'Phụ đề Việt',
        format: data.format || '2D',
    };

    return prisma.showtime.create({ data: normalizedData });
};

export const updateShowtime = async (id: string, data: any) => {
    const mappedData: any = {
        ...(data.movie_id || data.movieId ? { movie_id: data.movie_id || data.movieId } : {}),
        ...(data.room_id || data.roomId ? { room_id: data.room_id || data.roomId } : {}),
        ...(data.start_time || data.startTime ? { start_time: new Date(data.start_time || data.startTime) } : {}),
        ...(data.end_time || data.endTime ? { end_time: new Date(data.end_time || data.endTime) } : {}),
        ...(data.price !== undefined ? { price: Number(data.price) } : {}),
        ...(data.vip_price !== undefined || data.vipPrice !== undefined ? { vip_price: Number(data.vip_price ?? data.vipPrice) } : {}),
        ...(data.couple_price !== undefined || data.couplePrice !== undefined ? { couple_price: Number(data.couple_price ?? data.couplePrice) } : {}),
        ...(data.language ? { language: data.language } : {}),
        ...(data.format ? { format: data.format } : {}),
    };

    return prisma.showtime.update({
        where: { id },
        data: mappedData
    });
};

export const deleteShowtime = async (id: string) => {
    const bookingsCount = await prisma.booking.count({ where: { showtime_id: id } });
    if (bookingsCount > 0) {
        throw new AppError('Không thể xóa suất chiếu đã có người đặt vé.', 400);
    }
    return prisma.showtime.delete({ where: { id } });
};

export const getAdminUsers = async (query: { search?: string, page?: number, limit?: number }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
        role: 'USER', // ← CHỈ lấy user thường, bỏ ADMIN
    };

    if (query.search?.trim()) {
        where.OR = [
            { name:  { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search } }
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                loyalty_points: true,
                loyalty_tier: true,
                created_at: true,
                is_verified: true,
                is_banned: true,
                _count: { select: { bookings: true } }
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const getAdminUserSuggestions = async (query: string) => {
    const keyword = query.trim();
    if (!keyword) return [];

    const users = await prisma.user.findMany({
        where: {
            role: 'USER',
            OR: [
                { name: { contains: keyword } },
                { email: { contains: keyword } },
            ],
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
        orderBy: { created_at: 'desc' },
        take: 8,
    });

    return users;
};

export const getAdminUserDetail = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            _count: { select: { bookings: true } },
            bookings: {
                take: 5,
                orderBy: { created_at: 'desc' },
                include: {
                    showtime: { include: { movie: { select: { title: true } } } }
                }
            }
        }
    });

    if (!user) throw new AppError('Không tìm thấy người dùng', 404);

    const totalSpent = await prisma.booking.aggregate({
        where: { user_id: id, status: 'PAID' },
        _sum: { total_amount: true }
    });

    return {
        ...user,
        total_spent: totalSpent._sum.total_amount || 0
    };
};

export const banUser = async (userId: string, reason: string) => {
    return prisma.user.update({
        where: { id: userId },
        data: {
            is_banned: true,
            ban_reason: reason,
            refresh_token: null
        }
    });
};

export const getAllTickets = async (query: { status?: string, page?: number, limit?: number }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;

    const [tickets, total] = await Promise.all([
        prisma.supportTicket.findMany({
            where,
            include: {
                user: { select: { name: true, email: true, avatar_url: true } }
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        }),
        prisma.supportTicket.count({ where })
    ]);

    return {
        tickets,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const getTicketDetail = async (ticketId: string) => {
    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
            user: { select: { name: true, email: true, avatar_url: true } }
        }
    });

    if (!ticket) {
        throw new AppError('Không tìm thấy ticket hỗ trợ', 404);
    }

    return ticket;
};

export const replyTicket = async (ticketId: string, reply: string, adminId: string) => {
    const updatedTicket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
            admin_reply: reply,
            status: 'RESOLVED',
            replied_at: new Date()
        },
        include: {
            user: { select: { email: true, name: true } }
        }
    });

    // Gửi email thông báo cho user (Fire and forget)
    if (updatedTicket.user?.email) {
        emailService.sendSupportReplyEmail(
            updatedTicket.user.email,
            updatedTicket.user.name,
            updatedTicket.subject,
            reply
        ).catch(err => console.error('[ADMIN] Failed to send support reply email:', err));
    }

    return updatedTicket;
};
