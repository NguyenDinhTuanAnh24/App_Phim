import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Kiểm tra hôm nay có phải sinh nhật không
export function isBirthdayToday(dateOfBirth: Date): boolean {
  const today = dayjs();
  const dob = dayjs(dateOfBirth);
  return (
    today.date() === dob.date() &&
    today.month() === dob.month()
  );
}

// Kiểm tra có đang trong cửa sổ ưu đãi sinh nhật không
// Ưu đãi áp dụng đúng ngày sinh nhật
export function isBirthdayPeriod(dateOfBirth: Date): boolean {
  return isBirthdayToday(dateOfBirth);
}

// Lấy % giảm giá theo hạng thành viên
export function getBirthdayDiscount(loyaltyTier: string): number {
  const discounts: Record<string, number> = {
    'Đồng':       10,   // 10%
    'Bạc':        15,   // 15%
    'Vàng':       20,   // 20%
    'Kim cương':  30,   // 30%
  };
  return discounts[loyaltyTier] ?? 10;
}

// Tính số tiền giảm
export function calculateBirthdayDiscount(
  amount: number,
  loyaltyTier: string
): number {
  const percent = getBirthdayDiscount(loyaltyTier);
  return Math.floor(amount * percent / 100);
}

// Ngày sinh nhật tiếp theo
export function getNextBirthday(dateOfBirth: Date): Date {
  const today = dayjs();
  const dob = dayjs(dateOfBirth);
  
  // Set birthdays to current year
  let next = dayjs()
    .month(dob.month())
    .date(dob.date())
    .startOf('day');

  // If birthday already passed this year, set to next year
  if (next.isBefore(today, 'day')) {
    next = next.add(1, 'year');
  }
  
  return next.toDate();
}

// Số ngày đến sinh nhật tiếp theo
export function daysUntilBirthday(dateOfBirth: Date): number {
  const today = dayjs().startOf('day');
  const next = dayjs(getNextBirthday(dateOfBirth));
  return next.diff(today, 'day');
}
