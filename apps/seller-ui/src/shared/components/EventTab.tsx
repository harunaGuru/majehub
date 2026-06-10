import React from 'react'
import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
const getSellerEvents = async () => {
  const res = await axiosInstance.get('/seller/api/get-seller-events');
  const data = await res.data;
  return data;
}
const EventTab = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["seller-events"],
    queryFn: getSellerEvents,
  });

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {
        isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-slate-800 rounded animate-pulse" />
            <div className="h-4 bg-slate-800 rounded animate-pulse w-2/3" />
            <div className="h-4 bg-slate-800 rounded animate-pulse w-1/2" />
          </div>
        ) : events?.result?.length === 0 ? (
          <p className="text-slate-400">No events yet.</p>
        ) :
          events?.result?.map((event: any) => (
            <ProductCard key={event.id} {...event} />
          ))
      }
    </div>
  )
}

export default EventTab