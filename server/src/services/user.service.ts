import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { getTier, getNextTier, getProgressToNextTier } from '../utils/loyalty.util';
import { 
  isBirthdayToday, 
  daysUntilBirthday, 
  getBirthdayDiscount, 
  getNextBirthday 
} from '../utils/birthday.util';

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { bookings: true }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const { password_hash, refresh_token, ...safeUser } = user;
  
  const currentTierInfo = getTier(user.loyalty_points);
  const nextTierInfo = getNextTier(user.loyalty_points);
  const progressToNextTier = getProgressToNextTier(user.loyalty_points);
  
  const pointsToNextTier = nextTierInfo ? nextTierInfo.minPoints - user.loyalty_points : 0;

  const u = user as any;
  const birthdayInfo = u.date_of_birth ? {
    birthday:           u.date_of_birth,
    is_birthday_today:  isBirthdayToday(u.date_of_birth),
    days_until_birthday: daysUntilBirthday(u.date_of_birth),
    birthday_discount:  getBirthdayDiscount(u.loyalty_tier),
    next_birthday:      getNextBirthday(u.date_of_birth),
  } : null;

  return {
    ...safeUser,
    tierInfo: currentTierInfo,
    nextTier: nextTierInfo ? { name: nextTierInfo.name, minPoints: nextTierInfo.minPoints } : null,
    progressToNextTier,
    pointsToNextTier,
    totalBookings: user._count.bookings,
    memberSince: user.created_at,
    birthday_info: birthdayInfo,
  };
};

export const updateProfile = async (userId: string, data: { name?: string; phone?: string; birthday?: string }) => {
  if (data.phone) {
    const existingPhone = await prisma.user.findFirst({
      where: { phone: data.phone, id: { not: userId } }
    });
    if (existingPhone) {
      throw new Error('Số điện thoại đã được đăng ký cho tài khoản khác');
    }
  }

  console.log('[UPDATE PROFILE] Received data:', data);

  const updatePayload: any = {
    ...(data.name && { name: data.name }),
    ...(data.phone && { phone: data.phone }),
  };

  if (data.birthday) {
    const dob = new Date(data.birthday);
    console.log('[UPDATE PROFILE] Birthday parsed:', dob);
    updatePayload.date_of_birth = dob;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updatePayload
  });

  console.log('[UPDATE PROFILE] Update successful for user:', user.id);

  const { password_hash, refresh_token, ...safeUser } = user;
  return safeUser;
};

export const updateAvatar = async (userId: string, avatarUrl: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { avatar_url: avatarUrl }
  });
  return { avatarUrl };
};

export const changePassword = async (userId: string, data: { currentPassword: string; newPassword: string }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(data.currentPassword, user.password_hash);
  if (!isMatch) {
    throw new Error('Mật khẩu hiện tại không đúng');
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password_hash: hashedPassword,
      refresh_token: null, // Force re-login
    }
  });

  return { message: 'Đổi mật khẩu thành công' };
};

export const getLoyaltyHistory = async (userId: string, page: number = 1) => {
  const limit = 20;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    (prisma as any).loyaltyLog.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    (prisma as any).loyaltyLog.count({
      where: { user_id: userId }
    })
  ]);

  // Tính tổng điểm đã kiếm và đã dùng
  const [earnTotal, redeemTotal] = await Promise.all([
    (prisma as any).loyaltyLog.aggregate({
      where: { user_id: userId, type: 'EARN' },
      _sum: { points: true }
    }),
    (prisma as any).loyaltyLog.aggregate({
      where: { user_id: userId, type: 'REDEEM' },
      _sum: { points: true }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
    },
    summary: {
      totalEarned: earnTotal._sum.points ?? 0,
      totalRedeemed: Math.abs(redeemTotal._sum.points ?? 0),
    }
  };
};

export const getLoyaltySummary = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loyalty_points: true }
  });

  if (!user) throw new Error('User not found');

  const [earnedAgg, redeemedAgg] = await Promise.all([
    (prisma as any).loyaltyLog.aggregate({
      where: { user_id: userId, type: 'EARN' },
      _sum: { points: true }
    }),
    (prisma as any).loyaltyLog.aggregate({
      where: { user_id: userId, type: 'REDEEM' },
      _sum: { points: true }
    })
  ]);

  return {
    points: user.loyalty_points,
    totalEarned: earnedAgg._sum.points ?? 0,
    totalRedeemed: Math.abs(redeemedAgg._sum.points ?? 0),
  };
};
