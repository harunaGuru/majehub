import React from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from "lucide-react";

type ShopCardProps = {
  shop: {
    id: string;
    name: string;
    avatar: string;
    coverBanner: string;
    followers?: [];
    address: string;
    ratings: number;
    category: string;
  }
}
const ShopCard = ({ shop }: ShopCardProps) => {
  return (
    <div className="bg-white rounded-l-md rounded-r-sm shadow-sm hover:shadow-md transition overflow-hidden w-full max-w-sm">
      {/* Cover Banner */}
      <div className="relative h-32 w-full">
        <Image
          src={shop.coverBanner}
          alt={shop.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="w-full h-full object-cover"
        />

        {/* Avatar */}
        <div className="absolute h-14 w-14 z-10 -bottom-10 left-1/2 -translate-x-1/2">
          <Image
            src={shop.avatar}
            alt={shop.name}
            fill
            sizes="(max-width: 640px) 56px, (max-width: 1024px) 50px, 56px"
            className="w-14 h-14 rounded-full border-4 border-white object-cover  "
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-8 pb-5 px-4 text-center flex flex-col items-center space-y-2">
        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-800 font-jost">
          {shop.name}
        </h3>

        {/* Followers */}
        <p className="text-sm text-gray-500">
          {shop.followers?.length || shop.followers || 0} followers
        </p>

        {/* Address + Rating */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <span className="max-w-[130px] truncate font-jost text-sm">
            {shop.address}
          </span>
          <span>•</span>
          <span className="font-medium">⭐ {shop.ratings}</span>
        </div>

        {/* Category */}
        <div className='p-2 w-fit rounded-2xl bg-gray-500/10 mb-2'>
          <p className="text-xs text-blue-600/80 font-semibold uppercase tracking-wider">
            {shop.category}
          </p>
        </div>

        {/* Visit Shop */}
        <Link
          href={`/shop/${shop.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Visit Shop <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default ShopCard