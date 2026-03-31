import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/constants';
import { useAuthStore } from '@/stores/authStore';

const toCamel = (value: string) => value.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

const normalizeKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeKeys(item));
  }
  if (isPlainObject(value)) {
    const normalized: Record<string, unknown> = {};
    Object.entries(value).forEach(([key, entryValue]) => {
      normalized[toCamel(key)] = normalizeKeys(entryValue);
    });
    return normalized;
  }
  return value;
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token?: string) => void> = [];

const processQueue = (token?: string) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (response?.data && (isPlainObject(response.data) || Array.isArray(response.data))) {
      response.data = normalizeKeys(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          const headers = AxiosHeaders.from(originalRequest.headers);
          headers.set('Authorization', `Bearer ${token}`);
          originalRequest.headers = headers;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh-token`,
        { refreshToken }
      );
      const newAccessToken = response.data?.data?.accessToken as string | undefined;
      const newRefreshToken = response.data?.data?.refreshToken as string | undefined;
      if (!newAccessToken || !newRefreshToken) {
        await useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      await useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
      processQueue(newAccessToken);

      const headers = AxiosHeaders.from(originalRequest.headers);
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      originalRequest.headers = headers;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue();
      await useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
