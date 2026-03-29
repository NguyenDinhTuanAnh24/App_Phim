import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, "Tên phải có tối thiểu 2 ký tự").max(50, "Tên không được vượt quá 50 ký tự"),
  email: z.string().email("Định dạng email không đúng"),
  phone: z.string().regex(/^0\d{9}$/, "Số điện thoại phải gồm 10 số và bắt đầu bằng 0").optional().or(z.literal('')),
  subject: z.enum([
    'Lỗi ứng dụng',
    'Vấn đề thanh toán',
    'Vé điện tử',
    'Hoàn tiền',
    'Góp ý',
    'Khác'
  ]),
  message: z.string().min(10, "Nội dung phải có tối thiểu 10 ký tự").max(500, "Nội dung không được vượt quá 500 ký tự"),
});
