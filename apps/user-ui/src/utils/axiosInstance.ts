import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/store/auth-store';

let redirectToLogin = () => {
  const setLoggedIn = useAuthStore.getState().setLoggedIn;
  setLoggedIn(false);
  window.location.href = '/login';
};
// const setRedirectHandler = (handler:()=>void)=> {
//   redirectToLogin = handler;
// }
export const runRedirectToLogin = () => {
  redirectToLogin();
};

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  requireAuth: boolean;
}
const handleLogout = () => {
  if (typeof window === 'undefined') return;
  const publicPath = ['/login', '/signup', '/forgot-password'];
  const currentPath = window.location.pathname;
  if (!publicPath.includes(currentPath)) return runRedirectToLogin();
};

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

    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/refresh-token')) {
      return Promise.reject(error);
    }
    const isAuthRequired = originalRequest?.requireAuth;
    if (!isAuthRequired) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push(() => resolve(axiosInstance(originalRequest)));
      });
    }

    isRefreshing = true;

    try {
      await axios.post(
        `${
          process.env.NEXT_PUBLIC_AUTH_URL as string
        }/auth/api/refresh-token-user`,
        {},
        { withCredentials: true }
      );
      refreshQueue.forEach((cb) => cb());
      refreshQueue = [];

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      refreshQueue = [];
      handleLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
