import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';

const fetchSeller = async () => {
  try {
    const { data } = await axiosInstance.get(
      '/auth/api/logged-in-seller'
    )

    return data
  } catch (error: any) {
    if (error?.response?.status === 401) {
      throw new Error('Unauthorized')
    }

    throw error
  }
}

export const useSeller = () => {
  const { data: seller, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['seller'],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5, // 5 mins
    retry: false,
    refetchOnWindowFocus: false,
  });

  return { seller, isLoading, isFetching, isError, error, refetch };
}