import * as QRCode from 'qrcode';
import * as jwt from 'jsonwebtoken';

interface QRTokenPayload {
  bookingId: string;
  userId: string;
  showtimeId: string;
  type: 'TICKET';
}

export const generateQRToken = (booking: {
  id: string,
  userId: string,
  showtimeId: string
}): string => {
  const payload: QRTokenPayload = {
    bookingId: booking.id,
    userId: booking.userId,
    showtimeId: booking.showtimeId,
    type: 'TICKET'
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: '30d'
  });
}

export const generateQRImage = async (token: string): Promise<string> => {
  return await QRCode.toDataURL(token, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
}

export const verifyQRToken = (token: string): QRTokenPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as QRTokenPayload;
  } catch (err) {
    return null;
  }
}