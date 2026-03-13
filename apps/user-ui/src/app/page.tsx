"use client";
import Hero from '@/app/shared/module/Hero';
import ProductCard from "@/app/shared/components/ProductCard";
import SectionTitle from "@/app/shared/components/SectionTitle";
import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import ProductCardSkeleton from '@/app/shared/components/ProductCard/ProductCardSkeleton';


const fetchAllProducts = async() => {
  const response = await axiosInstance.get('/product/api/get-latest-top-products',{
    params: {
      limit: 10,
    },

  });
  console.log("all products loaded", response.data);
  return response.data;
}
const fetchTopProducts = async() => {
  const response = await axiosInstance.get('/product/api/get-latest-top-products', {
    params: {
      limit: 10,
      type: 'topSales',
    },
  });
  return response.data;
}
export default function Index() {
  const {data, isLoading} = useQuery({
    queryKey: ['latest-products'],
    queryFn: fetchAllProducts,
  })
  const { data: topProducts, isLoading:isTopLoading } = useQuery({
    queryKey: ['top-products'],
    queryFn: fetchTopProducts,
  });

  console.log("products", data);
  console.log("topProducts", topProducts);
  return (
    <div className="w-full  bg-gray-100">
      <>
        <Hero />
        <div className="mt-8 max-w-7xl mx-auto w-full px-6 space-y-6">
          <div className="space-y-4">
            <SectionTitle title="Latest Products" />
            <div className="grid grid-cols-5 gap-4">
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))
                : data.products &&
                  data.products.map((product: any) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
            </div>
          </div>
          <div className="space-y-4">
            <SectionTitle title="Suggested Products" />
            <div className="grid grid-cols-5 gap-4">
              {isTopLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))
                : topProducts.products &&
                  topProducts.products.map((product: any) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
