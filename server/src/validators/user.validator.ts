import { z } from 'zod';
import dayjs from 'dayjs';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(50, 'Tên không được vượt quá 50 ký tự').optional(),
  phone: z.string()
    .length(10, 'Số điện thoại phải có đúng 10 chữ số')
    .regex(/^0/, 'Số điện thoại phải bắt đầu bằng số 0')
    .optional(),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày sinh phải là YYYY-MM-DD')
    .refine(val => {
      const d = dayjs(val);
      return d.isValid()
        && d.isBefore(dayjs())
        && dayjs().diff(d, 'year') >= 5
        && dayjs().diff(d, 'year') <= 120;
    }, 'Ngày sinh không hợp lệ (tuổi từ 5 đến 120)')
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
  newPassword: z.string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'Mật khẩu phải bao gồm chữ hoa, chữ thường và số'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Xác nhận mật khẩu không khớp',
  path: ['confirmPassword']
});
