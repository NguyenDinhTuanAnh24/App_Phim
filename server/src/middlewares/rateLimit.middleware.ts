import rateLimit from 'express-rate-limit';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' }
});

export const otpRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Đã gửi quá nhiều OTP, vui lòng thử lại sau 10 phút' }
});
