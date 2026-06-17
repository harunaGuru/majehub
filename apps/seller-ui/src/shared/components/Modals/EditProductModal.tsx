"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { CustomProperties } from "../CustomProperty";
import { CustomSpecifications } from "../CustomSpecification";
import { CustomColors } from "../CustomColors";
import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery } from "@tanstack/react-query";
import { RichTextEditor } from "../RichTextEditor";
import Input from "../customInput";
import { SizeSelector } from "../CustomSize";


type FormValues = {
  title?: string;
  short_Description?: string;
  detailed_description?: string;
  tags?: string[]
  warranty?: string;
  brand?: string;
  colors?: string[];
  customProperties?: {
    name: string;
    values: string[];
  }[];
  custom_specification?: {
    name: string;
    value: string;
  }[];
  cashOnDelivery?: string;
  category?: string;
  subCategory?: string;
  video_url?: string;
  sale_price?: number;
  regular_price?: number;
  sizes?: string[];
  stock?: string;
};

interface Props {
  product: any;
  onClose: () => void;
  onSave: (updatedProduct: FormValues) => void;
  isLoading?: boolean;
}

const fetchCategories = async () => {
  const response = await axiosInstance.get('/product/api/categories');
  console.log(response.data);
  return response.data;
};

export const EditProductModal = ({
  product,
  onClose,
  onSave,
  isLoading: isEditLoading,
}: Props) => {
  const { register, handleSubmit, watch, formState: { errors, dirtyFields }, control, setValue } = useForm<FormValues>({
    defaultValues: {
      // title: product.title,
      // category: product.category,
      // warranty: product.warranty || "",
      // subCategory: product.subCategory,
      // short_Description: product.short_Description,
      // detailed_description: product.detailed_description,
      // brand: product.brand || "",
      // cashOnDelivery: product.cashOnDelivery || "",
      // colors: product.colors?.join(", ") || "",
      // customProperties: product.customProperties || [],
      // custom_specification: product.custom_specification || [],
      // video_url: product.video_url || "",
      // sale_price: product.sale_price,
      // regular_price: product.regular_price || 0,
      // sizes: product.sizes?.join(", ") || "",
      // stock: product.stock.toString(),
      // tags: product.tags?.join(", ") || "",
    },
  });

  const selectedCategory = watch('category');
  useEffect(() => {
    setValue('subCategory', '');
  }, [selectedCategory]);

  const {
    isLoading,
    data,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  const subCategories =
    selectedCategory && data?.subCategories[selectedCategory]
      ? data.subCategories[selectedCategory]
      : [];

  const onSubmit = (data: FormValues) => {
    const changedData: Partial<FormValues> = {};

    (Object.keys(dirtyFields) as (keyof FormValues)[]).forEach((key) => {
      (changedData as any)[key] = data[key];
    });

    onSave(changedData as FormValues);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center lg:pl-20 justify-center z-30">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-gray-900 text-white p-6 rounded-lg w-5/6 max-w-4xl h-[80vh] overflow-y-auto flex">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        {/* Image on the Left */}
        <div className="w-1/3 flex-shrink-0 p-4">
          <img
            src={
              product.images?.[0]?.fileUrl ||
              "https://via.placeholder.com/200"
            }
            alt={product.title}
            className="rounded-lg w-full h-auto object-contain"
          />
        </div>
        {/* Form on the Right */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-2/3 p-4 flex flex-col gap-4"
        >
          {/* Title */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Title</label>
            <input
              type="text"
              {...register("title")}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700"
            />
            {errors.title && (
              <span className="text-red-500 text-sm">
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Category</label>
            <select
              {...register('category')}
              className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-white"
            >
              <option value="">Choose category</option>

              {isLoading && <option>Loading...</option>}

              {data &&
                !error &&
                data?.categories.map((category: string) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
            {errors.category && (
              <span className="text-red-500 text-sm">
                {errors.category.message}
              </span>
            )}
          </div>

          {/* Sub-category */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Sub-category</label>
            <select
              {...register('subCategory')}
              disabled={!selectedCategory}
              className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-0 focus:border-gray-600"
            >
              {!selectedCategory && (
                <option value="">Select a category first</option>
              )}

              {selectedCategory && (
                <>
                  <option value="">Choose subcategory</option>
                  {subCategories.map((sub: string) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.subCategory && (
              <span className="text-red-500 text-sm">
                {errors.subCategory.message}
              </span>
            )}
          </div>

          {/* Short Description */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Short Description</label>
            <textarea
              placeholder="Enter product description for quick view"
              rows={5}
              {...register('short_Description', {
                validate: (value) => {
                  const wordCount = value
                    ? value
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length
                    : 0;
                  return wordCount <= 150 || 'Maximum of 150 words allowed';
                },
              })}
              className="w-full bg-transparent text-white placeholder-gray-400  border border-gray-700 rounded-md px-4 py-3  outline-none focus:border-white  transition "
            />
            {errors.short_Description && (
              <span className="text-red-500 text-sm">
                {errors.short_Description.message}
              </span>
            )}
          </div>

          {/* Detailed Description */}
          <RichTextEditor
            name="detailed_description"
            control={control}
            label="Detailed Description * (Min 100 words)"
            placeholder="Write full product details..."
            error={errors.detailed_description}
          />
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Warranty</label>
            <Input
              placeholder="1 year/No Warranty"
              {...register('warranty')}
              className="!bg-transparent text-white !border-gray-700 focus:ring-1 focus:ring-white focus:border-white"
            />
          </div>
          {/* Brand */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Brand</label>
            <input
              type="text"
              {...register("brand")}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700"
            />
          </div>
          {/* Tags */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Tags</label>
            <Input
              placeholder="apple,flagship"
              {...register('tags', {
                setValueAs: (value: unknown) => {
                  if (typeof value !== 'string') return [];
                  return value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean); // removes empty strings
                },
              })}
              className="!bg-transparent text-white !border-gray-700 focus:ring-1 focus:ring-white focus:border-white"
            />
          </div>
          {/* Cash on Delivery */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Cash on Delivery</label>
            <select
              {...register('cashOnDelivery')}
              className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-white"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Colors */}
          <CustomColors name="colors" control={control as any} />

          {/* Sizes */}
          <SizeSelector
            control={control as any}
            name="sizes"
            label="Sizes"
            error={errors.sizes}
          />

          {/* Custom Properties (using custom component) */}
          <div>
            <CustomProperties control={control as any} setValue={setValue} />
          </div>

          {/* Custom Specifications (using custom component) */}
          <div>
            <CustomSpecifications control={control as any} register={register} name="custom_specification" />
          </div>

          {/* Video URL */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Video URL</label>
            <input
              type="url"
              {...register("video_url")}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700"
            />
            {errors.video_url && (
              <span className="text-red-500 text-sm">
                {errors.video_url.message}
              </span>
            )}
          </div>

          {/* Regular Price */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Regular Price</label>
            <input
              type="number"
              {...register('regular_price', { valueAsNumber: true })}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700"
            />
            {errors.regular_price && (
              <span className="text-red-500 text-sm">
                {errors.regular_price.message}
              </span>
            )}
          </div>

          {/* Sale Price */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Sale Price</label>
            <input
              type="number"
              {...register("sale_price", { valueAsNumber: true })}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700"
            />
            {errors.sale_price && (
              <span className="text-red-500 text-sm">
                {errors.sale_price.message}
              </span>
            )}
          </div>


          {/* Stock */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Stock</label>
            <input
              type="number"
              {...register("stock")}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700"
            />
            {errors.stock && (
              <span className="text-red-500 text-sm">
                {errors.stock.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 mt-6 mb-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isEditLoading}
              className="bg-gray-500 px-4 py-2 hover:bg-gray-400 transition rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEditLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              {isEditLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
    // </div>
  );
};