import { CustomAxiosRequestConfig } from '@/utils/axiosInstance.types';

export const isProtected = ():CustomAxiosRequestConfig=>({
  requireAuth: true
})