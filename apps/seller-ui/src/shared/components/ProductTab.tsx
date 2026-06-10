import React from 'react'
import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
const getSellerProducts = async () => {
  const res = await axiosInstance.get('/seller/api/get-seller-products');
  const data = await res.data;
  return data;
}
const ProductTab = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["seller-products"],
    queryFn: getSellerProducts,
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
        ) : products?.result?.length === 0 ? (
          <p className="text-slate-400">No products yet.</p>
        ) :
          products?.result?.map((product: any) => (
            <ProductCard key={product.id} {...product} />
          ))
      }
    </div>
  )
}

export default ProductTab