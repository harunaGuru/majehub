"use client"
import ShopHero from './ShopHero'
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/utils/axiosInstance';
import ProductCardSkeleton from '../ProductCard/ProductCardSkeleton';
import ProductCard from '../ProductCard';
import { useEffect } from "react";
import { ReviewsPanel } from "../ReviewCard";
import { ReviewsSkeleton } from "../ReviewCard/ReviewSkeleton";
import { useUserDevice } from '@/hooks/useDeviceTracking';
import { useGeoLocation } from '@/hooks/useLocationTracking';
import { sendKafkaEvent } from '@/actions/track-user';
import { useAuthUser } from '@/hooks/useAuthUser';
import { DeviceInfo, GeoData } from '@/store';
import { useRouter } from 'next/navigation';

interface Props {
  shop: any;
  followersCount: number;
}
type TabType = "products" | "offers" | "reviews";


const ShopDetailsPage: React.FC<Props> = ({ shop, followersCount }: Props) => {
  const [active, setActive] = useState<TabType>("products");
  const [pages, setPages] = useState<Record<TabType, number>>({
    products: 1,
    offers: 1,
    reviews: 1,
  });
  const {
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceType,
    cpuArch,
  } = useUserDevice();
  const { geoData } = useGeoLocation();
  const { user, isLoading: userLoading } = useAuthUser()
  const router = useRouter()


  useEffect(() => {
    router.push(`?tab=${active}`)
  }, [active, router]);

  useEffect(() => {
    if (!userLoading) {
      if (!geoData || !browserName || !user?.id) return;
      function buildShopEvent(
        type: string,
        shop: any,
        user: any,
        location: GeoData,
        deviceInfo: DeviceInfo
      ) {
        return {
          type,
          shopId: shop.id,
          userId: user?.id ?? 'anonymous',
          country: location?.country || 'Unknown',
          city: location?.city || 'Unknown',
          device: deviceInfo || 'Unknown device',
          timestamp: new Date().toISOString(),
        };
      }
      const shopEvent = buildShopEvent('shop_visit', shop, user, geoData!, {
        browserName,
        browserVersion,
        osName,
        osVersion,
        deviceType,
        cpuArchitecture: cpuArch,
      });
      sendKafkaEvent(shopEvent)
    }
  }, [userLoading, geoData, browserName]);



  useEffect(() => {
    setPages((prev) => ({
      ...prev,
      [active]: 1,
    }));
  }, [active]);

  const shopId = shop.id;

  const { data: products, isLoading } = useQuery({
    queryKey: ["shop-products", shopId, pages.products],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/api/get-shop-products/${shopId}?page=${pages.products}&limit=10`
      );
      return res.data.result;
    },
  });

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ["shop-offers", shopId, pages.offers],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/api/get-shop-events/${shopId}?page=${pages.offers}&limit=10`
      );
      return res.data.result;
    },
  });

  const { data: shopReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["shop-reviews", shopId, pages.reviews],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/api/get-shop-reviews/${shopId}?page=${pages.reviews}&limit=10`
      );
      return res.data.result;
    },
  });

  const tabs = [
    { key: "products", label: "Products" },
    { key: "offers", label: "Offers" },
    { key: "reviews", label: "Reviews" }
  ];
  const tabMap: Record<TabType, any> = {
    products: products,
    offers: offers,
    reviews: shopReviews,
  };

  const activeData = tabMap[active];
  const totalPages = activeData?.meta?.totalPages ?? 1;
  const currentPage = activeData?.meta?.page ?? pages[active];

  const goToPage = (newPage: number) => {
    setPages((prev) => ({
      ...prev,
      [active]: newPage,
    }));
  };

  const reviews = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    name: ["John D.", "Aisha K.", "Emeka O.", "Fatima S.", "Kwame B.", "Zara M."][i],
    rating: 3 + (i % 3),
    date: "2 days ago",
    comment: "Great quality products and fast delivery. Highly recommended!",
    avatar: `https://i.pravatar.cc/100?img=${i + 10}`
  }));

  return (
    <div className='w-full min-h-screen bg-white flex flex-col gap-4'>
      <ShopHero shopData={shop} followersCount={followersCount} />
      {/* TABS */}
      <div className='w-full max-w-6xl mx-auto z-10 px-4 sm:px-8 lg:px-10'>
        <div className="relative border-b">
          <div className="flex gap-4 sm:gap-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key as TabType)}
                className={`relative pb-3 text-sm font-medium ${active === t.key ? "text-black" : "text-gray-500"}`}
              >
                {t.label}
                {active === t.key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute left-0 right-0 -bottom-px h-[2px] bg-black"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* CONTENT */}
      <div className="mt-6 w-full max-w-6xl mx-auto z-10 px-4 sm:px-8 lg:px-10">
        <AnimatePresence mode="wait">
          {active === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              ) : (
                products?.map((p: any) => {
                  return <ProductCard key={p.id} {...p} />
                })
              )}
            </motion.div>
          )}

          {active === "offers" && (
            <motion.div
              key="offers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {offersLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              ) : (
                offers?.map((p: any) => (
                  <ProductCard key={p.id} {...p} event={true} />
                ))
              )}
            </motion.div>
          )}

          {active === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='pb-6'
            >
              {reviewsLoading ? (
                <ReviewsSkeleton />
              ) : (
                <ReviewsPanel reviews={reviews} rating={shop?.ratings} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center flex-wrap gap-2 mt-8 mb-6 px-4">
        <button
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
          className="px-4 py-1.5 rounded-md bg-gray-100 text-sm font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                currentPage === pageNum
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
          className="px-4 py-1.5 rounded-md bg-gray-100 text-sm font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default ShopDetailsPage