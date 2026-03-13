'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import Rating from '@/app/shared/components/Rating';
import { useMemo} from "react";
import {useUserDevice} from "@/hooks/useDeviceTracking";
import {useGeoLocation} from "@/hooks/useLocationTracking";
import { CartWishlistItem, useStore } from '@/store';
import { useAuthUser } from '@/hooks/useAuthUser';

const ProductCard = ({
  id,
  title,
  images,
  sale_price,
  regular_price,
  slug,
  stock,
  shop,
  starting_date,
  totalSales
}: ProductCardProps) => {
  const {browserName, browserVersion, osName, osVersion, deviceModel, deviceType, cpuArch} = useUserDevice()
  const {geoData} =useGeoLocation()
  const {cart, wishlist, addToCart, removeFromCart, addToWishlist, removeFromWishlist} = useStore()
  const {user} = useAuthUser()
  const isEvent = starting_date !== null;
  const isLimited = stock < 10;
   console.log('isEvent', isEvent);
  const userInfo = {
    name: user?.name,
    id: user?.id,
  };
  const isInCart = useMemo(
      () => cart.some((item: CartWishlistItem) => item.product.id === id),
      [cart, id]
  );

  const isInWishlist = useMemo(
    () => wishlist.some((item:CartWishlistItem) => item.product.id === id),
    [wishlist, id]
  );

  const productPayload = {
    id,
    title,
    price: sale_price,
    quantity: 1,
    image:
      images[0]?.fileUrl ||
      'https://ik.imagekit.io/3k74bqena/products/ryan-plomp-jvoZ-Aux9aw-unsplash__1__hQGw2_LW9.avif?updatedAt=1772530464579',
    shopId: shop?.id,
    selectedOption: undefined,
  };

  const handleAddToWishList =()=>{
    if(isInWishlist){
      removeFromWishlist(
          productPayload,
          userInfo,
          geoData!,
          {
            browserName,
            browserVersion,
            osName,
            osVersion,
            deviceModel,
            deviceType,
            cpuArchitecture: cpuArch,
          }
      )
    }else {
      addToWishlist(
          productPayload,
          userInfo,
          geoData!,
          {
            browserName,
            browserVersion,
            osName,
            osVersion,
            deviceModel,
            deviceType,
            cpuArchitecture: cpuArch,
          }
      )
    }
  }

  const handleAddToCart =()=>{
    if(isInCart){
      removeFromCart(
          productPayload,
          userInfo,
          geoData!,
          {
            browserName,
            browserVersion,
            osName,
            osVersion,
            deviceModel,
            deviceType,
            cpuArchitecture: cpuArch,
          }
      )
    }else {
      addToCart(
          productPayload,
         userInfo,
          geoData!,
          {
            browserName,
            browserVersion,
            osName,
            osVersion,
            deviceModel,
            deviceType,
            cpuArchitecture: cpuArch,
          }
      )
    }
  }
  return (
    <div className=" bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden ">
      {/* IMAGE SECTION */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        <Link href={`/product/${slug}`} className="block w-full h-full">
          <Image
            src={
              images[0]?.fileUrl ||
              'https://ik.imagekit.io/3k74bqena/products/ryan-plomp-jvoZ-Aux9aw-unsplash__1__hQGw2_LW9.avif?updatedAt=1772530464579'
            }
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover"
          />
        </Link>
        {isLimited && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Limited
          </span>
        )}
        {isEvent && (
          <div className="absolute top-0 right-0">
            <div className="w-0 h-0 border-t-[60px] border-t-red-500 border-l-[60px] border-l-transparent"></div>
            <span className="absolute top-2 font-oregano right-1 text-[10px] font-bold text-white rotate-45">
              EVENT
            </span>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 y duration-300">
          <button
            onClick={handleAddToWishList}
            className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <Heart size={18} fill={isInWishlist ? 'white' : 'none'} />
          </button>

          <Link
            href={`/product/${slug}`}
            className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition"
          >
            <Eye size={18} />
          </Link>

          <button
            onClick={handleAddToCart}
            className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition ${
              isInCart ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            <ShoppingCart size={18} fill={isInCart ? 'white' : 'none'} />
          </button>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-4 space-y-2">
        {/* TITLE */}
        <Link
          href={`/product/${slug}`}
          className="text-sm font-medium line-clamp-2 hover:text-blue-600 transition"
        >
          {title}
        </Link>

        {/* RATING */}
        <div>
          <Rating value={4} />
        </div>

        {/* PRICE + SOLD */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-blue-600">
              ${sale_price}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ${regular_price}
            </span>
          </div>

          <span className="text-xs text-gray-500">{totalSales} sold</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
