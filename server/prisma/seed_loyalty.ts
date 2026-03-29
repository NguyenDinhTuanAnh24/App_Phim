import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = "cmna3017s0000vhe8k2ea9wuy"; // ID từ log của user nãy
  
  console.log(`[SEED] Bắt đầu nạp dữ liệu lịch sử điểm cho user: ${userId}`);

  // 1. Thưởng đăng ký
  await (prisma as any).loyaltyLog.create({
    data: {
      user_id:     userId,
      points:      50,
      type:        'EARN',
      description: '🎁 Thưởng chào mừng thành viên mới',
    }
  });

  // 2. Quà sinh nhật
  await (prisma as any).loyaltyLog.create({
    data: {
      user_id:     userId,
      points:      100,
      type:        'EARN',
      description: '🎂 Quà tặng sinh nhật từ App Phim',
    }
  });

  // 3. Đổi voucher
  await (prisma as any).loyaltyLog.create({
    data: {
      user_id:     userId,
      points:      -20,
      type:        'REDEEM',
      description: '🎟️ Đổi voucher giảm giá 20k bắp nước',
    }
  });

  // 4. Cộng điểm từ vé xem phim
  await (prisma as any).loyaltyLog.create({
    data: {
      user_id:     userId,
      points:      35,
      type:        'EARN',
      description: '🎬 Tích lũy từ vé xem phim "Dune: Part Two"',
    }
  });

  // Cập nhật tổng điểm cho User để khớp với log
  await prisma.user.update({
    where: { id: userId },
    data: { loyalty_points: { increment: 165 } } // 50 + 100 - 20 + 35
  });

  console.log('[SEED] Hoàn tất nạp dữ liệu!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
