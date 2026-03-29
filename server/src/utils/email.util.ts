import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTPEmail = async (to: string, otp: string, name: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || `"App Phim" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Mã xác thực App Phim',
    html: `
      <div style="background-color: #0A0A0A; padding: 20px; color: #FFFFFF; font-family: Arial, sans-serif; text-align: center;">
        <h2 style="color: #E50914;">Mã xác thực của bạn</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Mã OTP của bạn là:</p>
        <div style="font-size: 32px; font-weight: bold; color: #E50914; margin: 20px 0; letter-spacing: 5px;">${otp}</div>
        <p>Mã này sẽ hết hạn sau 5 phút.</p>
        <p style="font-size: 12px; color: #888; margin-top: 30px;">Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || `"App Phim" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Đặt lại mật khẩu App Phim',
    html: `
      <div style="background-color: #0A0A0A; padding: 20px; color: #FFFFFF; font-family: Arial, sans-serif; text-align: center;">
        <h2 style="color: #E50914;">Yêu cầu đặt lại mật khẩu</h2>
        <p>Mã OTP để nhận lại mật khẩu của bạn là:</p>
        <div style="font-size: 32px; font-weight: bold; color: #E50914; margin: 20px 0; letter-spacing: 5px;">${otp}</div>
        <p>Mã này sẽ hết hạn sau 5 phút.</p>
        <p style="font-size: 12px; color: #888; margin-top: 30px;">Nếu bạn không yêu cầu mã này, hãy bỏ qua email này và giữ an toàn tài khoản.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendSupportToAdmin = async (data: { name: string; email: string; phone?: string; subject: string; message: string }) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || `"App Phim Support" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    subject: `[HỖ TRỢ] ${data.subject} - ${data.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Có một yêu cầu hỗ trợ mới trên App Phim</h2>
        <ul>
          <li><strong>Họ tên:</strong> ${data.name}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>SĐT:</strong> ${data.phone || 'Không cung cấp'}</li>
          <li><strong>Chủ đề:</strong> ${data.subject}</li>
        </ul>
        <h3>Nội dung:</h3>
        <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-left: 4px solid #E50914;">${data.message}</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendSupportToUser = async (to: string, name: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || `"App Phim" <${process.env.SMTP_USER}>`,
    to,
    subject: 'App Phim đã nhận yêu cầu của bạn',
    html: `
      <div style="background-color: #0A0A0A; padding: 20px; color: #FFFFFF; font-family: Arial, sans-serif;">
        <h2 style="color: #E50914; text-align: center;">Yêu cầu hỗ trợ đã được ghi nhận</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Cảm ơn bạn đã liên hệ với đội ngũ CSKH App Phim.</p>
        <p>Chúng tôi đã nhận được thông tin yêu cầu hỗ trợ của bạn và sẽ nhanh chóng kiểm tra, xử lý, và phản hồi sớm nhất cho bạn <strong>trong vòng 24 giờ tới</strong>.</p>
        <p style="margin-top: 20px; color: #888; font-size: 13px;">Chúc bạn một ngày xem phim vui vẻ!</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
