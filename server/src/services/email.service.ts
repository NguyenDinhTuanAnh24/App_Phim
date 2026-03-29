import nodemailer from 'nodemailer';
import { Prisma } from '@prisma/client';

// Simplified type for booking details
interface BookingWithDetails {
  id: string;
  user_id: string;
  qr_code: string;
  qr_image_url: string | null;
  total_amount: number;
  status: string;
  paid_at: Date | null;
  created_at: Date;
  expires_at: Date;
  showtime: {
    movie: {
      title: string;
      poster_url: string | null;
    };
    start_time: Date;
    room: {
      name: string;
      cinema: {
        name: string;
        address: string;
      };
    };
  };
  booking_items: Array<{
    seat: {
      row: string;
      col: number;
    };
  }>;
  food_items: Array<{
    combo: {
      name: string;
    };
    quantity: number;
  }>;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,  // false với port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Dùng SMTP_PASS thay cho SMTP_PASSWORD
  },
});

// Verify kết nối khi server khởi động
transporter.verify((error, success) => {
  if (error) {
    console.error('[EMAIL] SMTP connection failed:', error.message);
  } else {
    console.log('[EMAIL] SMTP ready to send emails');
  }
});

export const sendBookingConfirmation = async (booking: any) => {
  try {
    // Lấy email người dùng từ object lồng nhau
    const userEmail = booking.user?.email;
    if (!userEmail) {
      throw new Error('User email not found in booking details');
    }

    // Create seat list
    const seats = booking.booking_items?.map((item: any) => `${item.seat.row}${item.seat.col}`).join(', ') || '';

    // Create food list
    const foods = booking.food_items?.map((item: any) => `${item.combo.name} × ${item.quantity}`).join(', ') || '';

    // Create HTML template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Xác nhận đặt vé thành công - ${booking.showtime.movie.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #121212; color: #FFFFFF;">
        <!-- Header -->
        <div style="background-color: #c00; padding: 20px; text-align: center;">
          <h1 style="margin: 0; color: #fff;">🎬 ĐẶT VÉ THÀNH CÔNG</h1>
        </div>

        <!-- Hero -->
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
          <img src="${booking.showtime.movie.poster_url}" alt="Movie poster" style="max-width: 200px; border-radius: 8px;">
        </div>

        <!-- Main content -->
        <div style="background-color: #121212; padding: 20px;">
          <h2 style="color: #fff; text-align: center;">${booking.showtime.movie.title}</h2>

          <!-- Showtime info -->
          <div style="background-color: #1a1a1a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h3 style="color: #fff; margin-top: 0;">Thông tin suất chiếu</h3>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <div style="width: 24px;">🎭</div>
              <div style="margin-left: 10px;">${booking.showtime.room.cinema.name} - ${booking.showtime.room.name}</div>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <div style="width: 24px;">🕒</div>
              <div style="margin-left: 10px;">${new Date(booking.showtime.start_time).toLocaleString('vi-VN')}</div>
            </div>
          </div>

          <!-- Seats info -->
          <div style="background-color: #1a1a1a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h3 style="color: #fff; margin-top: 0;">Ghế đã đặt</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              ${seats}
            </div>
          </div>

          <!-- Foods info -->
          ${foods ? `
          <div style="background-color: #1a1a1a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h3 style="color: #fff; margin-top: 0;">Combo đồ ăn</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              ${foods}
            </div>
          </div>
          ` : ''}

          <!-- QR Code -->
          ${booking.qr_image_url ? `
          <div style="background-color: #fff; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
            <h3 style="color: #000; margin-top: 0;">MÃ QR - VÉ ĐIỆN TỬ</h3>
            <img src="${booking.qr_image_url}" alt="QR Code" style="max-width: 250px; border-radius: 8px;">
            <p style="color: #000; font-weight: bold;">Xuất trình mã này tại quầy soát vé</p>
            <p style="color: #666; font-size: 12px;">Mã vé: ${booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
          ` : ''}

          <!-- Footer -->
          <div style="background-color: #1a1a1a; border-radius: 8px; padding: 16px; text-align: center; margin-top: 20px;">
            <p style="margin: 0; color: #fff;">Cảm ơn bạn đã sử dụng <strong>App Phim</strong></p>
            <p style="margin: 0; color: #fff; font-size: 12px;">Mọi thắc mắc vui lòng liên hệ hỗ trợ</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@appphim.com',
      to: userEmail,
      subject: `🎬 Đặt vé thành công - ${booking.showtime.movie.title}`,
      html
    });
  } catch (error) {
    console.error('[EMAIL] Error sending email:', error);
    throw error;
  }
};
export const sendBirthdayEmail = async (user: any) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Chúc mừng sinh nhật, ${user.name}! 🎂</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #121212; color: #FFFFFF; text-align: center;">
        <div style="background-color: #c00; padding: 30px;">
          <h1 style="margin: 0; color: #fff;">🎂 CHÚC MỪNG SINH NHẬT</h1>
        </div>
        <div style="padding: 40px; background-color: #1a1a1a; margin: 20px; border-radius: 12px;">
          <h2 style="color: #fff;">Chào ${user.name},</h2>
          <p style="font-size: 16px; line-height: 1.6;">Thay mặt đội ngũ <strong>App Phim</strong>, chúc bạn một ngày sinh nhật thật ý nghĩa và tràn đầy niềm vui!</p>
          <div style="margin: 30px 0; padding: 20px; background-color: #2a2a2a; border-radius: 8px; border: 1px dashed #c00;">
            <p style="font-size: 18px; color: #F59E0B; margin: 0;">🎁 Quà tặng cho bạn:</p>
            <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">+100 ĐIỂM THÀNH VIÊN</p>
            <p style="font-size: 14px; color: #888;">Điểm đã được cộng vào tài khoản của bạn.</p>
          </div>
          <p style="font-size: 14px; color: #888;">Đừng quên sử dụng ưu đãi giảm giá đặc biệt trong ngày sinh nhật khi đặt vé hôm nay nhé!</p>
          <a href="#" style="display:inline-block; background-color: #c00; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">ĐẶT VÉ NGAY</a>
        </div>
        <div style="color: #666; font-size: 12px; padding-bottom: 20px;">
          <p>© 2026 App Phim Official. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@appphim.com',
      to: user.email,
      subject: `🎂 Chúc mừng sinh nhật, ${user.name}! Quà tặng từ App Phim`,
      html
    });
  } catch (error) {
    console.error('[EMAIL] Birthday email failed:', error);
  }
};

export { transporter };