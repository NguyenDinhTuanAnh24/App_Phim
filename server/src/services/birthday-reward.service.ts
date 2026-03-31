import { prisma } from '../utils/prisma';

const BIRTHDAY_BONUS_POINTS = Number(process.env.BIRTHDAY_BONUS_POINTS || 100);

const getRewardDescription = (year: number) => `🎂 Quà tặng sinh nhật ${year}`;

export const grantBirthdayRewardOnLogin = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, date_of_birth: true, loyalty_points: true },
  });

  if (!user?.date_of_birth) {
    return { granted: false as const, pointsGranted: 0 };
  }

  const now = new Date();
  const birthDate = new Date(user.date_of_birth);
  const isBirthdayToday =
    birthDate.getDate() === now.getDate() &&
    birthDate.getMonth() === now.getMonth();

  if (!isBirthdayToday) {
    return { granted: false as const, pointsGranted: 0 };
  }

  const rewardYear = now.getFullYear();
  const description = getRewardDescription(rewardYear);

  const existingReward = await (prisma as any).loyaltyLog.findFirst({
    where: {
      user_id: user.id,
      type: 'EARN',
      description,
    },
    select: { id: true },
  });

  if (existingReward) {
    return { granted: false as const, pointsGranted: 0 };
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: user.id },
      data: { loyalty_points: { increment: BIRTHDAY_BONUS_POINTS } },
      select: { loyalty_points: true },
    });

    await (tx as any).loyaltyLog.create({
      data: {
        user_id: user.id,
        points: BIRTHDAY_BONUS_POINTS,
        type: 'EARN',
        description,
      },
    });

    return updated;
  });

  return {
    granted: true as const,
    pointsGranted: BIRTHDAY_BONUS_POINTS,
    currentPoints: updatedUser.loyalty_points,
  };
};

