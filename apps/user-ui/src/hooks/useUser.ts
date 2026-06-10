import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';
import { isProtected } from '@/utils/isProtected';

const fetchUser = async (loggedIn: boolean) => {
  const config = loggedIn ? isProtected() : {};
  const response = await axiosInstance.get('/auth/api/logged-in-user', config);
  return response.data;
};
export const useUser = () => {
  const loggedIn = useAuthStore((state) => state.loggedIn);
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
  const {
    data: user,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user', loggedIn],
    queryFn: () => fetchUser(loggedIn),
    staleTime: 1000 * 60 * 5, // 5 mins
    retry: false,
  });
  useEffect(() => {
    if (isSuccess) {
      setLoggedIn(true);
    }

    if (isError) {
      setLoggedIn(false);
    }
  }, [isSuccess, isError, setLoggedIn]);
  return { user, isLoading, isFetching, isError, error, refetch };
};
