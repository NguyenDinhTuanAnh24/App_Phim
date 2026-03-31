import cron from 'node-cron';
import { prisma } from '../utils/prisma';
import { sendBirthdayEmail } from '../services/email.service';

/**
 * Birthday Cron Job
 * Chạy lúc 8:00 sáng mỗi ngày để gửi email chúc mừng sinh nhật.
 * Điểm sinh nhật sẽ được cộng tại thời điểm user đăng nhập trong ngày sinh nhật.
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
      // Gửi email chúc mừng
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
