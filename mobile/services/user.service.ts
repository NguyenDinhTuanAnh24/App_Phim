import api from './api';

export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (payload: { name?: string; phone?: string; birthday?: string }) =>
    api.put('/users/me', payload),
  updateAvatar: (formData: FormData) =>
    api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.put('/users/me/password', payload),
  getLoyaltyHistory: (page = 1) =>
    api.get('/users/me/loyalty/history', { params: { page } }),
};
