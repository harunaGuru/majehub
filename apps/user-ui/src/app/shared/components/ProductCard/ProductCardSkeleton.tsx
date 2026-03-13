'use client';

import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {/* IMAGE SECTION */}
      <div className="relative w-full aspect-square bg-gray-200">
        {/* ACTION BUTTONS SKELETON */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-300 shadow-md" />
          <div className="w-9 h-9 rounded-full bg-gray-300 shadow-md" />
          <div className="w-9 h-9 rounded-full bg-gray-300 shadow-md" />
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-4 space-y-3">
        {/* TITLE (2 lines) */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
        </div>

        {/* RATING */}
        <div className="h-4 bg-gray-200 rounded w-24" />

        {/* PRICE + SOLD */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-300 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-12" />
          </div>

          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
