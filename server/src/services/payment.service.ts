import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

export const createPaymentUrl = async (
  bookingId: string,
  ipAddr: string
): Promise<string> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      showtime: {
        include: {
          movie: true,
        },
      },
    },
  });

  if (!booking) {
    throw new AppError('Booking không tồn tại', 404);
  }

  if (booking.status !== 'PENDING') {
    throw new AppError('Booking không ở trạng thái chờ thanh toán', 400);
  }

  const { createPaymentUrl: createVNPayUrl } = await import('../utils/vnpay.util');
  const paymentUrl = createVNPayUrl({
    bookingId: booking.id,
    amount: booking.total_amount,
    orderInfo: `Thanhtoanvephim${booking.id}`,
    ipAddr,
  });

  return paymentUrl;
};

export const handleVNPayReturn = async (query: Record<string, string>) => {
  const { verifyReturnUrl } = await import('../utils/vnpay.util');
  const verificationResult = verifyReturnUrl(query);

  if (!verificationResult.isValid) {
    return {
      success: false,
      message: 'Chữ ký không hợp lệ',
      bookingId: verificationResult.bookingId,
      reason: 'invalid_signature',
    };
  }

  const { bookingId, responseCode } = verificationResult;

  if (responseCode !== '00') {
    // Thanh toán thất bại / bị huỷ
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    }).catch(() => {}); // ignore nếu booking không tồn tại

    return {
      success: false,
      message: 'Thanh toán thất bại',
      bookingId,
      code: responseCode,
    };
  }

  // Thanh toán thành công
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (booking && booking.status === 'PENDING') {
    try {
      const { confirmPayment } = await import('./booking.service');
      await confirmPayment({
        bookingId,
        transactionId: query.vnp_TransactionNo || '',
      });
    } catch (err) {
      // IPN có thể đã confirm trước → bỏ qua
      console.error('[PAYMENT RETURN] confirmPayment error (may be OK if IPN ran first):', err);
    }
  }

  return { success: true, bookingId };
};

export const handleVNPayIPN = async (body: Record<string, string>) => {
  const { verifyIPN } = await import('../utils/vnpay.util');
  const verificationResult = verifyIPN(body);

  if (!verificationResult.isValid) {
    return { RspCode: '97', Message: 'Invalid signature' };
  }

  const { bookingId, responseCode, transactionId } = verificationResult;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking) {
    return { RspCode: '01', Message: 'Order not found' };
  }

  if (booking.status === 'PAID') {
    return { RspCode: '02', Message: 'Order already confirmed' };
  }

  // Kiểm tra số tiền khớp
  const vnpAmount = parseInt(body.vnp_Amount || '0') / 100;
  if (vnpAmount !== booking.total_amount) {
    console.error(`[IPN] Amount mismatch: expected ${booking.total_amount}, got ${vnpAmount}`);
    return { RspCode: '04', Message: 'Invalid amount' };
  }

  if (responseCode === '00') {
    try {
      const { confirmPayment } = await import('./booking.service');
      await confirmPayment({ bookingId, transactionId });
      console.log('[IPN] Confirmed booking:', bookingId);
    } catch (error) {
      console.error('[IPN] confirmPayment error:', error);
      // Vẫn trả 00 để VNPay không retry
    }
  } else {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    }).catch(() => {});
  }

  // VNPay luôn yêu cầu RspCode 00
  return { RspCode: '00', Message: 'Confirm success' };
};