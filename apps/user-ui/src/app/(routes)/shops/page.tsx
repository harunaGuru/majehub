"use client"
import React from 'react'
import { shopCategories } from '@/config/constant';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const Shops = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategories = searchParams.get('category')?.split(',') || [];

  const toggleCategory = (category: string) => {
    let updated = [...selectedCategories];

    if (updated.includes(category)) {
      updated = updated.filter((c) => c !== category);
    } else {
      updated.push(category);
    }

    const params = new URLSearchParams(searchParams.toString());

    if (updated.length) {
      params.set('category', updated.join(','));
    } else {
      params.delete('category');
    }

    params.set('page', '1');

    router.push(`/shops?${params.toString()}`);
  };
  return (
    <div className="bg-gray-200 w-full min-h-screen">
      <div className="w-[90%] lg:w-[80%] mx-auto py-10">
        <h1 className="text-3xl font-semibold text-gray-900 font-poppins">
          All Shops
        </h1>
        {/*BreadCrumbs*/}
        <div className="flex gap-1 items-baseline mb-10">
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 cursor-pointer"
          >
            Home
          </Link>
          <span className="p-0.5 h-1 bg-gray-500 rounded-full"></span>
          <span className="text-sm font-medium text-gray-500">All Shops</span>
        </div>
        <div className="w-full flex flex-col lg:flex-row gap-4">
          {/*Left Column*/}
          <div className=" w-full lg:w-[300px] bg-white rounded-sm shadow-md p-4 flex flex-col">
            <div className="flex flex-col">
              <h3 className="text-lg font-poppins font-semibold">
                Categories
              </h3>
              <hr className="border-gray-400 mb-2" />
              <div className="flex flex-col gap-2">
                {shopCategories.map((category) => (
                  <label
                    key={category.label}
                    className="flex items-center gap-2 text-sm capitalize"
                  >
                    <input
                      type="checkbox"
                      className="size-3.5"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => toggleCategory(category.value)}
                    />
                    {category.value}
                  </label>
                ))}
              </div>
          </div>
        </div>
          {/*Right Column*/}
          <div className="flex flex-col gap-2">

          </div>
      </div>
    </div>
    </div>
  );
};
export default Shops;
