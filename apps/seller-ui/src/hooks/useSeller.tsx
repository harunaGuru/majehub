import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';

const fetchSeller = async () => {
  const { data } = await axiosInstance.get('/auth/api/logged-in-seller');
  console.log('data from fetchSeller', data)
  return data;
}
export const useSeller = ()=>{
  const {data:seller, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['seller'],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5, // 5 mins
    retry: 1,
  });

  return { seller, isLoading, isFetching, isError, error, refetch };
}