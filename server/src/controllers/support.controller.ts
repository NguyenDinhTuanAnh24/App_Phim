import { Request, Response } from 'express';
import { sendSupportToAdmin, sendSupportToUser } from '../utils/email.util';

export const sendSupportRequest = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Send email to admin
    await sendSupportToAdmin({ name, email, phone, subject, message });

    // Send confirmation email to user
    await sendSupportToUser(email, name);

    res.status(200).json({ success: true, message: "Gửi yêu cầu thành công" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Đã xảy ra lỗi khi gửi yêu cầu hỗ trợ" });
  }
};
