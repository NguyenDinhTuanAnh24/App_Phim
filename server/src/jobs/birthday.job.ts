import cron from 'node-cron';
import { prisma } from '../utils/prisma';
import { sendBirthdayEmail } from '../services/email.service';

/**
 * Birthday Cron Job
 * Chạy lúc 8:00 sáng mỗi ngày để gửi quà (100 điểm) và email chúc mừng sinh nhật cho người dùng.
 */
cron.schedule('0 8 * * *', async () => {
  console.log('[BIRTHDAY JOB] Bắt đầu kiểm tra sinh nhật hôm nay...');
  
  const today = new Date();
  const month = today.getMonth() + 1;
  const day   = today.getDate();

  try {
    // Tìm tất cả user có ngày sinh
    const users = await prisma.user.findMany({
      where: {
        date_of_birth: {
          not: null,
        }
      }
    });

    const birthdayUsers = users.filter(u => {
      if (!u.date_of_birth) return false;
      const bd = new Date(u.date_of_birth);
      return bd.getMonth() + 1 === month && bd.getDate() === day;
    });

    for (const user of birthdayUsers) {
      // 1. Cộng 100 điểm sinh nhật
      await prisma.user.update({
        where: { id: user.id },
        data: { loyalty_points: { increment: 100 } }
      });

      // 2. Ghi log lịch sử điểm thưởng
      await (prisma as any).loyaltyLog.create({
        data: {
          user_id:     user.id,
          points:      100,
          type:        'EARN',
          description: '🎂 Quà tặng sinh nhật',
        }
      });

      // 3. Gửi email chúc mừng
      await sendBirthdayEmail(user).catch(err => 
        console.error(`[BIRTHDAY JOB] Lỗi gửi email cho ${user.email}:`, err.message)
      );
      
      console.log('[BIRTHDAY JOB] Đã gửi quà sinh nhật cho:', user.email);
    }
    
    console.log(`[BIRTHDAY JOB] Hoàn tất. Đã gửi quà cho ${birthdayUsers.length} người dùng.`);
  } catch (error: any) {
    console.error('[BIRTHDAY JOB] Lỗi hệ thống:', error.message);
  }
});
