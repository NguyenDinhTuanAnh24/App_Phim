export interface User {
  id: string;
  email: string;
  phone?: string | null;
  name: string;
  avatarUrl?: string | null;
  role: 'USER' | 'ADMIN';
  loyaltyPoints: number;
  loyaltyTier?: string | null;
  createdAt?: string;
  dateOfBirth?: string | null;
  isVerified?: boolean;
  authProvider?: 'EMAIL' | 'GOOGLE' | 'BOTH';
  googleEmail?: string | null;
  tierInfo?: {
    name: string;
    color: string;
    icon: string;
    multiplier: number;
    perks?: string[];
  } | null;
  nextTier?: {
    name: string;
    minPoints: number;
    color?: string;
    icon?: string;
  } | null;
  progressToNext?: number;
  pointsToNextTier?: number;
  stats?: {
    totalBookings: number;
    totalSpent: number;
    loyaltyPoints: number;
  };
  recentLogs?: LoyaltyLog[];
  birthdayInfo?: {
    birthday: string;
    isBirthdayToday: boolean;
    daysUntilBirthday: number;
    birthdayDiscount: number;
    nextBirthday: string;
  } | null;
}

export interface Movie {
  id: string;
  tmdbId?: number;
  title: string;
  originalTitle?: string;
  overview?: string;
  posterUrl: string;
  backdropUrl?: string;
  trailerKey?: string | null;
  genres?: string[] | string;
  cast?: CastMember[] | string;
  director?: string;
  duration?: number;
  rating: number;
  language?: string;
  status: 'NOW_SHOWING' | 'COMING_SOON';
  releaseDate?: string;
}

export interface CastMember {
  name: string;
  character: string;
  profileUrl?: string | null;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  imageUrl?: string | null;
}

export interface Room {
  id: string;
  cinemaId?: string;
  name: string;
  type: 'STANDARD' | 'IMAX' | 'FOUR_DX';
  totalRows?: number;
  totalCols?: number;
  cinema?: Cinema;
}

export interface Seat {
  id: string;
  row: string;
  col: number;
  type: 'STANDARD' | 'VIP' | 'COUPLE' | 'DISABLED';
  status: 'AVAILABLE' | 'BOOKED' | 'LOCKED' | 'SELECTED' | 'DISABLED';
  price?: number;
}

export interface ShowtimeSlot {
  id: string;
  movieId?: string;
  movie?: Movie;
  roomId?: string;
  startTime: string;
  endTime: string;
  price: number;
  vipPrice: number;
  couplePrice: number;
  language: string;
  format: string;
  room?: Room;
  totalSeats?: number;
  availableSeats?: number;
  bookedSeats?: number;
  status?: 'AVAILABLE' | 'ALMOST_FULL' | 'SOLD_OUT';
}

export interface Booking {
  id: string;
  showtimeId?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  totalAmount: number;
  qrCode?: string;
  qrImageUrl?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  expiresAt: string;
  discountAmount?: number;
  voucherCode?: string | null;
  showtime?: ShowtimeSlot;
  bookingItems?: BookingItem[];
  foodItems?: FoodItem[];
  payment?: {
    id: string;
    bookingId: string;
    method: 'VNPAY' | 'MOMO' | 'CASH';
    amount: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    transactionId?: string | null;
    createdAt?: string;
  };
}

export interface BookingItem {
  id: string;
  seatId: string;
  price: number;
  showtimeId?: string;
  seat?: Seat;
}

export interface FoodCombo {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
}

export interface FoodItem {
  id: string;
  comboId: string;
  quantity: number;
  price: number;
  combo?: FoodCombo;
}

export interface Voucher {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minAmount: number;
  maxDiscount?: number | null;
  expiresAt: string;
  description?: string | null;
  source?: 'ADMIN' | 'SYSTEM' | 'POINT_REDEMPTION' | 'POINTS';
}

export interface SupportTicket {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'REPLIED' | 'RESOLVED';
  adminReply?: string | null;
  createdAt: string;
  updatedAt: string;
  repliedAt?: string | null;
}

export interface LoyaltyLog {
  id: string;
  points: number;
  type: string;
  description: string;
  bookingId?: string | null;
  createdAt: string;
}

export interface PointPackage {
  id: string;
  name: string;
  pointsCost?: number;
  pointsRequired?: number;
  voucherValue?: number;
  discountValue?: number;
  voucherType?: 'PERCENT' | 'FIXED';
  discountType?: 'PERCENT' | 'FIXED';
  description: string;
  minAmount?: number;
  maxDiscount?: number;
  validityDays?: number;
  icon?: string;
  color?: string;
  canRedeem?: boolean;
  pointsShort?: number;
  currentPoints?: number;
}

export interface MyVoucher {
  id: string;
  code: string;
  discountType?: 'PERCENT' | 'FIXED';
  discountValue?: number;
  minAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
  isUsed?: boolean;
  source?: 'SYSTEM' | 'POINTS' | 'POINT_REDEMPTION';
}
