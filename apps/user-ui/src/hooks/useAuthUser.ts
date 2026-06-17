import { useUser } from '@/hooks/useUser';
import { runRedirectToLogin } from '@/utils/axiosInstance';
import { useEffect } from 'react';

export const useAuthUser = () => {
  const { isLoading, user, refetch } = useUser();
  useEffect(() => {
    if (!isLoading && !user) {
      runRedirectToLogin();
    }
  }, [isLoading, user]);

  return { isLoading, user, refetch };
};
