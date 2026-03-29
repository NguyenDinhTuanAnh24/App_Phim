import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, message: result.message, data: null });
});

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.sendOtp(req.body.email);
  res.status(200).json({ success: true, message: result.message, data: null });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyOtp(req.body.email, req.body.otp);
  res.status(200).json({ success: true, message: "Xác thực thành công", data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body.email, req.body.password);
  res.status(200).json({ success: true, message: "Đăng nhập thành công", data: result });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshToken(req.body.refreshToken);
  res.status(200).json({ success: true, message: "Refresh token thành công", data: result });
});

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    await authService.logout(userId);

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.changePassword(req.user!.userId, req.body);
  res.status(200).json({ success: true, message: result.message, data: null });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  res.status(200).json({ success: true, message: result.message, data: null });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body.email, req.body.otp, req.body.newPassword);
  res.status(200).json({ success: true, message: result.message, data: null });
});