import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/utils/axiosInstance';

const fetchAdmin = async () => {
  const { data } = await axiosInstance.get('/admin/api/get-logged-in-admin');
  return data.admin;
}
export const useAdmin = () => {
  const { data: admin, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['admin'],
    queryFn: fetchAdmin,
    staleTime: 1000 * 60 * 5, // 5 mins
    retry: 1,
  });

  return { admin, isLoading, isFetching, isError, error, refetch };
}