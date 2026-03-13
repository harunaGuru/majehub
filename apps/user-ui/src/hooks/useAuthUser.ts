import { useUser } from '@/hooks/useUser';
import { runRedirectToLogin } from '@/utils/axiosInstance';

export const useAuthUser = () => {
  const {isLoading, user, refetch} = useUser()
  if(!isLoading && !user) {
    runRedirectToLogin()
  }
  return {isLoading, user, refetch };
}