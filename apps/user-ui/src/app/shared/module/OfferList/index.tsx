'use client';
import React from 'react';
import Link from 'next/link';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  defaultCategories,
  colors,
  sizes,
  ColorOption,
} from '@/config/constant';
import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import ProductCardSkeleton from '@/app/shared/components/ProductCard/ProductCardSkeleton';
import ProductCard from '@/app/shared/components/ProductCard';
import NoProductsFound from '@/app/shared/components/NoProductFound';

const OffersList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRange = searchParams.get('PriceRange') || '0,1199';
  const [min, max] = urlRange.split(',').map(Number);
  const [range, setRange] = useState<[number, number]>([min, max]);
  const [tempRange, setTempRange] = useState<[number, number]>([0, 1199]);
  const selectedCategories = searchParams.get('category')?.split(',') || [];
  const selectedColors = searchParams.get('color')?.split(',') || [];
  const selectedSizes = searchParams.get('size')?.split(',') || [];
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchProducts = async () => {
    const params = new URLSearchParams();
    params.set('PriceRange', `${range[0]},${range[1]}`);
    if (selectedCategories.length)
      params.set('category', selectedCategories.join(','));
    if (selectedColors.length) params.set('color', selectedColors.join(','));
    if (selectedSizes.length) params.set('size', selectedSizes.join(','));
    params.set('page', page.toString());
    params.set('limit', '20');

    const { data } = await axiosInstance.get(
      `/product/api/get-events?${params.toString()}`
    );
    return data;
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      'offers',
      range,
      selectedCategories,
      selectedColors,
      selectedSizes,
      page,
    ],
    queryFn: fetchProducts,
    // keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });
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

    router.push(`/products?${params.toString()}`);
  };

  const toggleColor = (color: string) => {
    let updated = [...selectedColors];

    if (updated.includes(color)) {
      updated = updated.filter((c) => c !== color);
    } else {
      updated.push(color);
    }

    const params = new URLSearchParams(searchParams.toString());

    if (updated.length) {
      params.set('color', updated.join(','));
    } else {
      params.delete('color');
    }

    params.set('page', '1');

    router.push(`/products?${params.toString()}`);
  };

  const toggleSize = (size: string) => {
    let updated = [...selectedSizes];

    if (updated.includes(size)) {
      updated = updated.filter((s) => s !== size);
    } else {
      updated.push(size);
    }

    const params = new URLSearchParams(searchParams.toString());

    if (updated.length) {
      params.set('size', updated.join(','));
    } else {
      params.delete('size');
    }

    params.set('page', '1');

    router.push(`/products?${params.toString()}`);
  };

  const applyFilter = () => {
    setRange(tempRange);

    const params = new URLSearchParams(searchParams.toString());
    params.set('PriceRange', `${tempRange[0]},${tempRange[1]}`);
    params.set('page', '1');

    router.push(`/products?${params.toString()}`);
  };
  return (
    <div className="bg-gray-200 w-full min-h-screen">
      <div className="w-[90%] lg:w-[80%] mx-auto py-10">
        <h1 className="text-3xl font-semibold text-gray-900 font-poppins">
          All Products
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
          <span className="text-sm font-medium text-gray-500">All offers</span>
        </div>
        <div className="w-full flex flex-col lg:flex-row gap-4">
          {/*Left Column*/}
          <div className=" w-full lg:w-[300px] bg-white rounded-sm shadow-md p-4 flex flex-col  gap-6">
            {/*Price Filter*/}
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-poppins font-semibold">
                Price Filter
              </h3>
              <div
                className="
                    [&_.range-slider]:h-[6px]
                    lg:[&_.range-slider]:h-[3px]
                    [&_.range-slider__thumb]:w-4
                    [&_.range-slider__thumb]:h-4
                    lg:[&_.range-slider__thumb]:w-3
                    lg:[&_.range-slider__thumb]:h-3
                    "
              >
                <RangeSlider
                  min={0}
                  max={1199}
                  value={tempRange}
                  onInput={(value: number[]) =>
                    setTempRange([value[0], value[1]])
                  }
                />
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span>
                  ${tempRange[0]} - ${tempRange[1]}
                </span>
                <button
                  onClick={applyFilter}
                  className="px-3 py-1 bg-gray-200 text-gray-600 rounded-sm hover:bg-gray-400"
                >
                  Apply
                </button>
              </div>
            </div>
            {/*Categories*/}
            <div className="flex flex-col">
              <h3 className="text-lg font-poppins font-semibold">Categories</h3>
              <hr className="border-gray-400 mb-2" />
              <div className="flex flex-col gap-2">
                {defaultCategories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="size-3.5"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
            {/*Colors*/}
            <div className="flex flex-col">
              <h3 className="text-lg font-poppins font-semibold">
                Filter by Color
              </h3>
              <hr className="border-gray-400 mb-2" />
              <div className="flex flex-col gap-2">
                {colors.map((color: ColorOption) => (
                  <label
                    key={color.name}
                    className="flex items-center gap-3 text-sm capitalize cursor-pointer"
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color.value)}
                      onChange={() => toggleColor(color.value)}
                      className="cursor-pointer w4 h-4  "
                    />

                    {/* Color Indicator */}
                    <span
                      className={`w-4 h-4 rounded-full border border-gray-300 ${color.bg}`}
                    />

                    {/* Label */}
                    {color.name}
                  </label>
                ))}
              </div>
            </div>
            {/*Sizes*/}
            <div className="flex flex-col">
              <h3 className="text-lg font-poppins font-semibold">
                Filter by Size
              </h3>

              <hr className="border-gray-400 mb-2" />

              <div className="flex flex-col gap-2">
                {sizes.map((size: string) => (
                  <label
                    key={size}
                    className="flex items-center gap-2 text-sm uppercase cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => toggleSize(size)}
                      className="cursor-pointer w-4 h-4"
                    />

                    {size}
                  </label>
                ))}
              </div>
            </div>
          </div>
          {/*Right Column*/}
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : data?.products?.length === 0 ? (
              <NoProductsFound />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.products.map((product: any) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
                {/* Pagination */}
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: data?.pagination?.pages }, (_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded ${page === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200'
                        }`}
                      onClick={() => {
                        const params = new URLSearchParams(
                          searchParams.toString()
                        );
                        params.set('page', (i + 1).toString());
                        router.push(`/products?${params.toString()}`);
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default OffersList;
