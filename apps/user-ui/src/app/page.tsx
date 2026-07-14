"use client";
import Hero from '@/app/shared/module/Hero';
import ProductCard from "@/app/shared/components/ProductCard";
import SectionTitle from "@/app/shared/components/SectionTitle";
import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import ProductCardSkeleton from '@/app/shared/components/ProductCard/ProductCardSkeleton';
import ShopCardSkeleton from './shared/components/shopCard/shopCardSkeleton';
import ShopCard from './shared/components/shopCard';


const fetchLatestProduct = async () => {
  const response = await axiosInstance.get('/product/api/get-latest-top-products', {
    params: {
      limit: 10,
    },

  });
  return response.data;
}
const fetchLatestOffers = async () => {
  const response = await axiosInstance.get('/product/api/get-latest-offers', {
    params: {
      limit: 10,
    },

  });
  return response.data;
}
// const fetchTopProducts = async () => {
//   const response = await axiosInstance.get('/product/api/get-latest-top-products', {
//     params: {
//       limit: 10,
//       type: 'topSales',
//     },
//   });
//   return response.data;
// }
const fetchTopShops = async () => {
  const response = await axiosInstance.get('/product/api/top-shops')
  return response.data;
}
const fetchRecommendedProducts = async () => {
  const response = await axiosInstance.get('/recommendation/api/recommended-products')
  return response.data.data;
}

export default function Index() {
  const { data, isLoading } = useQuery({
    queryKey: ['latest-products'],
    queryFn: fetchLatestProduct,
  })
  const { data: latestOffers, isLoading: isLatestOffersLoading } = useQuery({
    queryKey: ['latest-offers'],
    queryFn: fetchLatestOffers,
  });

  const { data: topShops, isLoading: isTopShopsLoading } = useQuery({
    queryKey: ['top-shops'],
    queryFn: fetchTopShops,
  });

  const { data: recommendedProducts, isLoading: isRecommendedLoading } = useQuery({
    queryKey: ['recommended-products'],
    queryFn: fetchRecommendedProducts,
  });
  return (
    <div className="w-full  bg-gray-100">
      <>
        <Hero />
        <div className="mt-8 pb-6 max-w-7xl mx-auto w-full px-6 space-y-6">
          <div className="space-y-4">
            <SectionTitle title="Latest Products" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
                : data?.products &&
                data?.products?.map((product: any) => (
                  <ProductCard key={product.id} {...product} />
                ))}
            </div>
          </div>
          <div className="space-y-4">
            <SectionTitle title="Top Offers" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5  gap-4">
              {isLatestOffersLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
                : latestOffers?.products &&
                latestOffers?.products?.map((product: any) => (
                  <ProductCard key={product.id} {...product} />
                ))}
            </div>
          </div>
          <div className="space-y-4">
            <SectionTitle title="Suggested Products" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5  gap-4">
              {isRecommendedLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
                : recommendedProducts &&
                recommendedProducts?.map((product: any) => (
                  <ProductCard key={product.id} {...product} />
                ))}
            </div>
          </div>
          <div className='space-y-4'>
            <SectionTitle title="Top Shops" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5  gap-4">
              {isTopShopsLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                  <ShopCardSkeleton key={i} />
                ))
                : topShops?.data &&
                topShops?.data?.map((shop: any) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
