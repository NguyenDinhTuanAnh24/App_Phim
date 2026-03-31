import api from './api';

export const pointsService = {
  getPackages: () => api.get('/points/packages'),
  redeemPoints: (packageId: string) => api.post('/points/redeem', { package_id: packageId }),
  getMyVouchers: () => api.get('/points/my-vouchers'),
  getPointHistory: () => api.get('/points/history'),
};