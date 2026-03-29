import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';

export function generateQRToken(booking: {
  id: string;
  userId: string;
  showtimeId: string;
}): string {
  return jwt.sign(
    {
      bookingId: booking.id,
      userId: booking.userId,
      showtimeId: booking.showtimeId,
      type: 'TICKET',
    },
    ACCESS_SECRET,
    { expiresIn: '30d' }
  );
}

export async function generateQRImage(token: string): Promise<string> {
  return QRCode.toDataURL(token, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

export function verifyQRToken(token: string): {
  bookingId: string;
  userId: string;
  showtimeId: string;
} | null {
  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as any;
    if (payload.type !== 'TICKET') return null;
    return {
      bookingId: payload.bookingId,
      userId: payload.userId,
      showtimeId: payload.showtimeId,
    };
  } catch {
    return null;
  }
}
