import api from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    birthday?: string;
  }) => api.post('/auth/register', payload),
  sendOtp: (email: string) => api.post('/auth/send-otp', { email }),
  verifyOtp: (email: string, otp: string) =>
    api.post('/auth/verify-otp', { email, otp }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (payload: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }) => api.post('/auth/reset-password', payload),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
  googleSignIn: (idToken: string) =>
    api.post('/auth/google', { idToken }),
  linkGoogle: (idToken: string) =>
    api.post('/auth/google/link', { idToken }),
  unlinkGoogle: () => api.delete('/auth/google/link'),
  getAuthProviders: () => api.get('/auth/providers'),
};
