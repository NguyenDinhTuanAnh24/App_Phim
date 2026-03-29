import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError';
import { generateOTP, hashOTP, verifyOTP } from '../utils/otp.util';
import { sendOTPEmail, sendResetPasswordEmail } from '../utils/email.util';
import redisClient from '../utils/redis.util';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export const register = async (data: any) => {
  const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingEmail) throw new AppError("Email đã được sử dụng", 409);

  if (data.phone) {
    const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existingPhone) throw new AppError("Số điện thoại đã được sử dụng", 409);
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password_hash: passwordHash,
      role: 'USER',
      loyalty_points: 0,
      is_verified: false,
    }
  });

  await sendOtp(data.email);

  return { message: "Đăng ký thành công, vui lòng xác thực email" };
};

export const sendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Email không tồn tại", 404);

  const otpKey = `otp:${email}`;
  const existingOtpCache = await redisClient.get(otpKey);
  
  if (existingOtpCache) {
    const ttl = await redisClient.ttl(otpKey);
    throw new AppError(`Vui lòng chờ ${ttl} giây trước khi gửi lại`, 400);
  }

  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);

  await redisClient.setEx(otpKey, parseInt(process.env.OTP_EXPIRES_MINUTES || '5') * 60, JSON.stringify({ hash: hashedOtp, attempts: 0 }));

  await sendOTPEmail(email, otp, user.name);

  return { message: `Đã gửi mã OTP đến ${email}` };
};

export const verifyOtp = async (email: string, otp: string) => {
  const otpKey = `otp:${email}`;
  const otpDataStr = await redisClient.get(otpKey);

  if (!otpDataStr) throw new AppError("Mã OTP đã hết hạn", 400);

  const otpData = JSON.parse(otpDataStr);

  if (otpData.attempts >= 5) {
    await redisClient.del(otpKey);
    throw new AppError("Đã nhập sai quá nhiều lần", 400);
  }

  const isValid = await verifyOTP(otp, otpData.hash);

  if (!isValid) {
    otpData.attempts += 1;
    await redisClient.setEx(otpKey, await redisClient.ttl(otpKey), JSON.stringify(otpData));
    throw new AppError("Mã OTP không đúng", 400);
  }

  await redisClient.del(otpKey);

  const user = await prisma.user.update({
    where: { email },
    data: { is_verified: true }
  });

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  const hashedRefreshToken = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { refresh_token: hashedRefreshToken }
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Email hoặc mật khẩu không đúng", 400);

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) throw new AppError("Email hoặc mật khẩu không đúng", 400);

  if (!user.is_verified) throw new AppError("Tài khoản chưa xác thực email", 403);

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  const hashedRefreshToken = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { refresh_token: hashedRefreshToken }
  });

  return {
    accessToken,
    refreshToken,
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      avatarUrl: user.avatar_url, 
      loyaltyPoints: user.loyalty_points 
    }
  };
};

export const refreshToken = async (token: string) => {
  const payload = verifyRefreshToken(token);
  if (!payload) throw new AppError("Token không hợp lệ", 401);

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.refresh_token) throw new AppError("Tài khoản không tồn tại", 401);

  const isValidToken = await bcrypt.compare(token, user.refresh_token);
  if (!isValidToken) throw new AppError("Token đã được sử dụng", 401);

  const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = generateRefreshToken({ userId: user.id });

  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { refresh_token: hashedRefreshToken }
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (userId?: string): Promise<void> => {
  if (!userId) return;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { refresh_token: null }
    });
  } catch (_) {
    // Bỏ qua lỗi nếu user không tồn tại hoặc lỗi connection
  }
};

export const changePassword = async (userId: string, data: any) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("Người dùng không tồn tại", 404);

  const isValidPassword = await bcrypt.compare(data.currentPassword, user.password_hash);
  if (!isValidPassword) throw new AppError("Mật khẩu hiện tại không đúng", 400);

  const newHash = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password_hash: newHash, refresh_token: null }
  });

  return { message: "Đổi mật khẩu thành công, vui lòng đăng nhập lại" };
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Email không tồn tại", 404);

  const otpKey = `reset:${email}`;
  const existingOtpCache = await redisClient.get(otpKey);
  
  if (existingOtpCache) {
    const ttl = await redisClient.ttl(otpKey);
    throw new AppError(`Vui lòng chờ ${ttl} giây trước khi gửi lại`, 400);
  }

  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);

  await redisClient.setEx(otpKey, parseInt(process.env.OTP_EXPIRES_MINUTES || '5') * 60, JSON.stringify({ hash: hashedOtp }));

  await sendResetPasswordEmail(email, otp);

  return { message: `Đã gửi mã OTP đến ${email}` };
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const otpKey = `reset:${email}`;
  const otpDataStr = await redisClient.get(otpKey);

  if (!otpDataStr) throw new AppError("Mã OTP đã hết hạn", 400);

  const otpData = JSON.parse(otpDataStr);
  const isValid = await verifyOTP(otp, otpData.hash);

  if (!isValid) throw new AppError("Mã OTP không đúng", 400);

  await redisClient.del(otpKey);

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { email },
    data: { password_hash: newHash, refresh_token: null }
  });

  return { message: "Đặt lại mật khẩu thành công" };
};
