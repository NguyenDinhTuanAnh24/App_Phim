import api from './api';

export const voucherService = {
  validateVoucher: (code: string, amount: number) =>
    api.post('/vouchers/validate', { code, amount }),
  getAvailableVouchers: (amount = 0) =>
    api.get('/vouchers/available', { params: { amount } }),
};