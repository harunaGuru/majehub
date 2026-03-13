import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

let redirectToLogin = ()=> {
  window.location.href = "/login";
}
// const setRedirectHandler = (handler:()=>void)=> {
//   redirectToLogin = handler;
// }
export const runRedirectToLogin = ()=> {
  redirectToLogin()
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  requireAuth: boolean;
}
const handleLogout = () => {
  const publicPath = ["/login", "/signup", "/forgot-password"];
  const currentPath = window.location.pathname;
  if(!publicPath.includes(currentPath)) {
    runRedirectToLogin();
  }
}

export type ApiError = {
  success: false;
  message: string;
};

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8080',
  withCredentials: true,
  // Add responseType if needed
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
    if(!isAuthRequired) {
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
        `${process.env.NEXT_PUBLIC_AUTH_URL as string}/auth/api/refresh-token-user`,
        {},
        { withCredentials: true }
      );
      refreshQueue.forEach((cb) => cb());
      refreshQueue = [];

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      refreshQueue = [];
      handleLogout();
      console.warn('Refresh failed', refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);




// import axios, {
//   AxiosError,
//   AxiosInstance,
//   InternalAxiosRequestConfig,
// } from 'axios';
//
// interface RetryableRequestConfig extends InternalAxiosRequestConfig {
//   _retry?: boolean;
// }
//
// export type ApiError = {
//   success: false;
//   message: string;
// };
//
// export const api: AxiosInstance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_AUTH_URL,   //'http://localhost:8080/api',
//   withCredentials: true,
// });
//
// let isRefreshing = false;
// let refreshQueue: Array<() => void> = [];
//
// //handling API Request
// api.interceptors.request.use((config)=> config, (error)=> Promise.reject(error) );
//
// api.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError<ApiError>) => {
//     const originalRequest = error.config as RetryableRequestConfig;
//
//     // ❌ No response → network error
//     if (!error.response) {
//       return Promise.reject(error);
//     }
//
//     // ❌ Not auth error
//     if (error.response.status !== 401) {
//       return Promise.reject(error);
//     }
//
//     // ❌ Already retried
//     if (originalRequest._retry) {
//       return Promise.reject(error);
//     }
//
//     // ❌ Don't refresh on refresh endpoint
//     if (originalRequest.url?.includes('/refresh-token')) {
//       return Promise.reject(error);
//     }
//
//     originalRequest._retry = true;
//
//     // 🔒 Refresh in progress → queue request
//     if (isRefreshing) {
//       return new Promise((resolve) => {
//         refreshQueue.push(() => resolve(api(originalRequest)));
//       });
//     }
//
//     isRefreshing = true;
//
//     try {
//       await axios.post(
//         `${process.env.NEXT_PUBLIC_AUTH_URL as string}/refresh-token-user`,
//         {},
//         {withCredentials: true},
//       );
//
//       refreshQueue.forEach((cb) => cb());
//       refreshQueue = [];
//
//       return api(originalRequest);
//     } catch (refreshError) {
//       refreshQueue = [];
//       window.location.href = '/login';
//       return Promise.reject(refreshError);
//     } finally {
//       isRefreshing = false;
//     }
//   }
// );
