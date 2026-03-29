import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import * as userService from '../services/user.service';
import { getTier, getNextTier, getProgressToNextTier } from '../utils/loyalty.util';
import { 
  isBirthdayToday, 
  getBirthdayDiscount, 
  daysUntilBirthday, 
  getNextBirthday 
} from '../utils/birthday.util';

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: 'PAID' }
            }
          }
        },
        bookings: {
          where: { status: 'PAID' },
          select: { total_amount: true }
        }
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User không tồn tại' });
      return;
    }

    // Tính tổng tiền đã chi
    const totalSpent = user.bookings.reduce(
      (sum, b) => sum + Number(b.total_amount), 0
    );

    // Tính tier và progress
    const tierInfo    = getTier(user.loyalty_points);
    const nextTier    = getNextTier(user.loyalty_points);
    const progress    = getProgressToNextTier(user.loyalty_points);
    const pointsToNext = nextTier
      ? nextTier.minPoints - user.loyalty_points
      : 0;

    res.status(200).json({
      success: true,
      data: {
        id:            user.id,
        name:          user.name,
        email:         user.email,
        phone:         user.phone,
        avatar_url:    user.avatar_url,
        loyalty_points: user.loyalty_points,
        loyalty_tier:  (user as any).loyalty_tier,
        is_verified:   user.is_verified,
        created_at:    user.created_at,
        // Thống kê thật từ DB
        stats: {
          total_bookings:  user._count.bookings,
          total_spent:     totalSpent,
          loyalty_points:  user.loyalty_points,
        },
        // Loyalty info
        tier_info: {
          name:        tierInfo.name,
          color:       tierInfo.color,
          icon:        tierInfo.icon,
          perks:       tierInfo.perks,
          multiplier:  tierInfo.multiplier,
        },
        next_tier:           nextTier ? {
          name:      nextTier.name,
          minPoints: nextTier.minPoints,
          color:     nextTier.color,
          icon:      nextTier.icon,
        } : null,
        progress_to_next:    progress,
        points_to_next_tier: pointsToNext,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const profile = await userService.updateProfile(userId, req.body);
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ảnh'
      });
      return;
    }

    // Tạo URL từ file đã lưu local bởi multer diskStorage
    const protocol = req.protocol;
    const host = req.get('host');
    const avatarUrl = `${protocol}://${host}/uploads/avatars/${req.file.filename}`;

    // Cập nhật DB
    await prisma.user.update({
      where: { id: userId },
      data: { avatar_url: avatarUrl }
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật ảnh thành công',
      data: { avatar_url: avatarUrl }
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const result = await userService.changePassword(userId, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getLoyaltySummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const summary = await userService.getLoyaltySummary(userId);
    res.json(summary);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getLoyaltyHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const page = parseInt(req.query.page as string) || 1;
    const result = await userService.getLoyaltyHistory(userId, page);

    res.status(200).json({
      success: true,
      data: result.logs,
      summary: result.summary,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getBirthdayStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        date_of_birth: true,
        loyalty_tier: true,
        name: true,
      }
    });

    if (!user?.date_of_birth) {
      res.status(200).json({
        success: true,
        data: {
          has_birthday: false,
          message: 'Chưa cập nhật ngày sinh nhật',
        }
      });
      return;
    }

    const isToday   = isBirthdayToday(user.date_of_birth);
    const discount  = getBirthdayDiscount(user.loyalty_tier ?? 'Đồng');
    const daysUntil = daysUntilBirthday(user.date_of_birth);

    res.status(200).json({
      success: true,
      data: {
        has_birthday:        true,
        is_birthday_today:   isToday,
        discount_percent:    discount,
        days_until_birthday: daysUntil,
        next_birthday:       getNextBirthday(user.date_of_birth),
        message: isToday
          ? `🎂 Chúc mừng sinh nhật ${user.name}! Bạn được giảm ${discount}% hôm nay!`
          : daysUntil <= 7
            ? `🎉 Còn ${daysUntil} ngày đến sinh nhật của bạn!`
            : null,
      }
    });
  } catch (error) {
    next(error);
  }
};
