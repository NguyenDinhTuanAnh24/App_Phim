import crypto from 'crypto';
import dayjs from 'dayjs';

/**
 * Theo đúng chuẩn sample Node.js của VNPay:
 * - Key được sắp xếp theo bảng chữ cái A-Z
 * - Value bắt buộc phải encodeURIComponent và thay khoảng trắng %20 thành dấu +
 * Cả chuỗi ký hash (hashData) VÀ URL trả về VNPay đều mang chung định dạng này.
 */
function sortObject(obj: Record<string, any>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, '+');
    }
  }
  return sorted;
}

export function createPaymentUrl(params: {
  bookingId: string;
  amount: number;
  orderInfo: string;
  ipAddr: string;
}): string {

  const tmnCode    = process.env.VNPAY_TMN_CODE!;
  const secretKey  = process.env.VNPAY_HASH_SECRET!;
  const vnpUrl     = process.env.VNPAY_URL!;
  const returnUrl  = process.env.VNPAY_RETURN_URL!;

  // BƯỚC 1: Build params chưa có chữ ký
  const rawParams: Record<string, string> = {
    vnp_Version   : '2.1.0',
    vnp_Command   : 'pay',
    vnp_TmnCode   : tmnCode,
    vnp_Amount    : String(params.amount * 100),  // ✅ Nhớ nhân 100
    vnp_CurrCode  : 'VND',
    vnp_TxnRef    : params.bookingId,
    vnp_OrderInfo : params.orderInfo, // Không tự replace khoảng trắng ở đây vì sortObject sẽ lo việc đó
    vnp_OrderType : 'other',
    vnp_Locale    : 'vn',
    vnp_ReturnUrl : returnUrl,
    vnp_IpAddr    : params.ipAddr,
    vnp_CreateDate: dayjs().format('YYYYMMDDHHmmss'),
    vnp_ExpireDate: dayjs().add(15, 'minute').format('YYYYMMDDHHmmss'), // Nên kèm Expiry Date để tránh lỗi Timeout
  };

  // BƯỚC 2: Sort A → Z và URL Encode các value
  const sortedParams = sortObject(rawParams);

  // BƯỚC 3: Tạo hashData bằng cách nối key=value 
  // (Lưu ý: value ĐÃ được encodeURIComponent bên trong sortObject để đồng nhất với định dạng URL)
  const hashData = Object.entries(sortedParams)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  // BƯỚC 4: Tạo chữ ký HMAC-SHA512 bằng secret key
  const secureHash = crypto
    .createHmac('sha512', secretKey)
    .update(Buffer.from(hashData, 'utf-8'))
    .digest('hex');

  // BƯỚC 5: Gắn chữ ký vào cuối chuỗi hashData ban nãy để tạo URL vì cả 2 sử dụng chung dạng encode
  const paymentUrl = `${vnpUrl}?${hashData}&vnp_SecureHash=${secureHash}`;

  // Log theo dõi (Không nên đưa lên production)
  console.log('[VNPAY] hashData   :', hashData);
  console.log('[VNPAY] secureHash :', secureHash);
  console.log('[VNPAY] paymentUrl :', paymentUrl);

  return paymentUrl;
}

export function verifyReturnUrl(query: Record<string, string>): {
  isValid: boolean;
  responseCode: string;
  bookingId: string;
  amount: number;
} {
  const secretKey = process.env.VNPAY_HASH_SECRET!;

  // Lấy riêng secure hash nhận được, phần còn lại dùng để rebuild chữ ký
  // Express tự động URLDecode nên giá trị đang là plain text.
  const {
    vnp_SecureHash,
    vnp_SecureHashType,
    ...rest
  } = query;

  // sortObject sẽ URL Encode plain text để khớp hoàn toàn với lúc generate
  const sortedParams = sortObject(rest);

  const hashData = Object.entries(sortedParams)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const signed = crypto
    .createHmac('sha512', secretKey)
    .update(Buffer.from(hashData, 'utf-8'))
    .digest('hex');

  console.log('[VNPAY RETURN] hashData  :', hashData);
  console.log('[VNPAY RETURN] signed    :', signed);
  console.log('[VNPAY RETURN] received  :', vnp_SecureHash);
  console.log('[VNPAY RETURN] isValid   :', signed === vnp_SecureHash);

  return {
    isValid     : signed === vnp_SecureHash,
    responseCode: query.vnp_ResponseCode,
    bookingId   : query.vnp_TxnRef,
    amount      : parseInt(query.vnp_Amount) / 100, // Chia lại 100 để có số tiền thực
  };
}

export function verifyIPN(query: Record<string, string>): {
  isValid: boolean;
  responseCode: string;
  bookingId: string;
  transactionId: string;
} {
  const secretKey = process.env.VNPAY_HASH_SECRET!;

  const {
    vnp_SecureHash,
    vnp_SecureHashType,
    ...rest
  } = query;

  const sortedParams = sortObject(rest);

  const hashData = Object.entries(sortedParams)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const signed = crypto
    .createHmac('sha512', secretKey)
    .update(Buffer.from(hashData, 'utf-8'))
    .digest('hex');

  return {
    isValid      : signed === vnp_SecureHash,
    responseCode : query.vnp_ResponseCode,
    bookingId    : query.vnp_TxnRef,
    transactionId: query.vnp_TransactionNo,
  };
}
