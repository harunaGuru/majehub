import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export type ApiError = {
  success: false;
  message: string;
};

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8080',
  withCredentials: true,
  responseType: 'json',
});

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

//handling API Request
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as RetryableRequestConfig;

    // ❌ No response → network error
    if (!error.response) {
      return Promise.reject(error);
    }

    // ❌ Not auth error
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // ❌ Already retried
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // ❌ Don't refresh on refresh endpoint
    if (originalRequest.url?.includes('/refresh-token')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // 🔒 Refresh in progress → queue request
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push(() => resolve(axiosInstance(originalRequest)));
      });
    }

    isRefreshing = true;
    try {
      await axiosInstance.post(
        '/admin/api/refresh-token-admin',
        {}
        // { withCredentials: true }
      );

      refreshQueue.forEach((cb) => cb());
      refreshQueue = [];

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      refreshQueue = [];
      window.location.href = '/';
      console.warn('Refresh failed', refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
