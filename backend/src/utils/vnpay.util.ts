import * as crypto from 'node:crypto';
import * as dayjs from 'dayjs';

interface VNPayParams {
  bookingId: string;
  amount: number;
  orderInfo: string;
  ipAddr: string;
  returnUrl?: string;
}

export const sortObject = (obj: Record<string, any>) => {
  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      sorted[key] = obj[key];
    }
  }

  return sorted;
}

export const createPaymentUrl = (params: VNPayParams): string => {
  const { bookingId, amount, orderInfo, ipAddr, returnUrl } = params;

  const vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: process.env.VNPAY_TMN_CODE,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: bookingId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100, // Convert to VND cents
    vnp_ReturnUrl: returnUrl || process.env.VNPAY_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: dayjs().format('YYYYMMDDHHmmss'),
    vnp_ExpireDate: dayjs().add(15, 'minute').format('YYYYMMDDHHmmss'),
  };

  // Sort parameters
  const sortedParams = sortObject(vnpParams);

  // Create query string
  const querystring = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  // Create signature
  const secretKey = process.env.VNPAY_HASH_SECRET || '';
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(querystring).digest('hex');

  // Add secure hash to query string
  const paymentUrl = `${process.env.VNPAY_URL}?${querystring}&vnp_SecureHash=${signed.toUpperCase()}`;

  return paymentUrl;
}

export const verifyReturnUrl = (query: Record<string, string>) => {
  // Extract vnp_SecureHash and remove it from query
  const secureHash = query.vnp_SecureHash;
  delete query.vnp_SecureHash;

  // Sort remaining parameters
  const sortedParams = sortObject(query);

  // Create query string
  const querystring = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Create signature
  const secretKey = process.env.VNPAY_HASH_SECRET || '';
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(querystring).digest('hex').toUpperCase();

  // Verify signature
  const isValid = signed === secureHash;
  const responseCode = query.vnp_ResponseCode || '';
  const bookingId = query.vnp_TxnRef || '';
  const amount = query.vnp_Amount ? parseInt(query.vnp_Amount) / 100 : 0;

  return {
    isValid,
    responseCode,
    bookingId,
    amount
  };
}

export const verifyIPN = (body: Record<string, string>) => {
  // Similar to verifyReturnUrl but for IPN
  const secureHash = body.vnp_SecureHash;
  delete body.vnp_SecureHash;

  const sortedParams = sortObject(body);
  const querystring = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const secretKey = process.env.VNPAY_HASH_SECRET || '';
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(querystring).digest('hex').toUpperCase();

  const isValid = signed === secureHash;
  const responseCode = body.vnp_ResponseCode || '';
  const bookingId = body.vnp_TxnRef || '';
  const transactionId = body.vnp_TransactionNo || '';

  return {
    isValid,
    responseCode,
    bookingId,
    transactionId
  };
}