'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ImagePlaceHolder from '@/shared/components/imagePlaceHolder';
import { useForm, Controller } from 'react-hook-form';
import Input from '@/shared/components/customInput';
import { CustomColors } from '@/shared/components/CustomColors';
import { CustomSpecifications } from '@/shared/components/CustomSpecification';
import { CustomProperties } from '@/shared/components/CustomProperty';
import { axiosInstance } from '@/utils/axiosInstance';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { SizeSelector } from '@/shared/components/CustomSize';
import { Spinner } from '@/shared/components/Spinner';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type FormValues = {
  title: string;
  short_Description: string;
  detailed_description: string;
  tags: string[];
  warranty: string;
  slug: string;
  brand?: string;
  images: {
    url: string;
    fileId: string;
  }[];
  colors: string[];
  customProperties: {
    name: string;
    values: string[];
  }[];
  custom_specification: {
    name: string;
    value: string;
  }[];
  cashOnDelivery: string;
  category: string;
  subCategory: string;
  video_url?: string;
  sale_price: number;
  regular_price?: number;
  sizes?: string[];
  stock: string;
  discount_code?: string[];
  starting_date: Date;
  ending_date: Date;
};

type Discount = {
  discountCode: string;
  public_name: string;
  discountType: 'Percentage' | 'Flat';
  discountValue: number;
  id: string;
};

interface ImageData {
  slotId: number; // Track which slot this image belongs to
  file: File;
  preview: string;
}

const MAX_IMAGES = 4;

const fetchCategories = async () => {
  const response = await axiosInstance.get('/product/api/categories');
  return response.data;
};

const createProduct = async (data: FormValues) => {
  const response = await axiosInstance.post(
    '/product/api/create-product',
    data
  );
  return response.data.product;
};

const CreateProduct = () => {
  const [images, setImages] = useState<ImageData[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      title: '',
      short_Description: '',
      detailed_description: '',
      tags: [],
      warranty: '',
      slug: '',
      brand: '',
      images: [],
      colors: [],
      customProperties: [],
      custom_specification: [],
      cashOnDelivery: '',
      category: '',
      subCategory: '',
      video_url: '',
      sale_price: undefined,
      regular_price: undefined,
      sizes: [],
      stock: '',
      discount_code: [],
      starting_date: new Date(), //today
      ending_date: new Date(Date.now() + 86400000), //  tomorrow,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) => createProduct(data),
    onSuccess: () => {
      reset()
    },
  });
  const selectedCategory = watch('category');
  useEffect(() => {
    setValue('subCategory', '');
  }, [selectedCategory]);

  const { isLoading, data, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  const {
    data: discounts = [],
    isLoading: isDiscountLoading,
    error: discountError,
    refetch,
  } = useQuery({
    queryKey: ['shop-discount'],
    queryFn: async () => {
      const response = await axiosInstance.get('/product/api/discounts');
      return response.data.discounts;
    },
  });
  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  const subCategories =
    selectedCategory && data?.subCategories[selectedCategory]
      ? data.subCategories[selectedCategory]
      : [];

  const getNextAvailableSlot = () => {
    const takenSlots = images.map((img) => img.slotId);
    for (let i = 0; i < MAX_IMAGES; i++) {
      if (!takenSlots.includes(i)) {
        return i;
      }
    }
    return -1; // No slots available
  };

  const handleImageSelect = (slotId: number, file: File, preview: string) => {
    setImages((prev) => {
      // Check if this slot is already taken
      const existingImageIndex = prev.findIndex((img) => img.slotId === slotId);

      if (existingImageIndex !== -1) {
        // Replace existing image in this slot
        const newImages = [...prev];
        newImages[existingImageIndex] = { slotId, file, preview };
        return newImages;
      } else {
        // Add new image to this slot
        return [...prev, { slotId, file, preview }];
      }
    });
  };

  const handleReplaceImage = (slotId: number, file: File, preview: string) => {
    setImages((prev) => {
      const index = prev.findIndex((img) => img.slotId === slotId);
      if (index !== -1) {
        const newImages = [...prev];
        newImages[index] = { slotId, file, preview };
        return newImages;
      }
      return prev;
    });
  };

  const handleDeleteImage = (slotId: number) => {
    setImages((prev) => prev.filter((img) => img.slotId !== slotId));
  };

  return (
    <div className="w-full min-h-screen p-4">
      <h1 className="font-poppins text-white ny-6 font-semibold text-lg tracking-wide pl-10 lg:pl-0">
        Create Event
      </h1>

      {/*BreadCrumbs*/}
      <div className="flex items-center text-white pl-10 lg:pl-0">
        <Link href="/dashboard" className="text-blue-600">
          Dashboard
        </Link>
        <span className="opacity-80">
          <ChevronRight size={20} />
        </span>
        <span>Create Event</span>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col lg:flex-row gap-3 mb-4 overflow-auto"
      >
        {/*upload images*/}
        <div className="w-full lg:w-[21rem] mt-2 pl-2 ">
          <div className="flex flex-wrap gap-4 items-start">
            {Array.from({ length: MAX_IMAGES }, (_, slotId) => {
              const image = images.find((img) => img.slotId === slotId);
              const isFilled = !!image;

              // Only render empty placeholder if this slot is empty AND it's the next available slot
              const isEmpty = !isFilled;
              const isNextAvailable = slotId === getNextAvailableSlot();

              // Don't render empty placeholders beyond the next available slot
              if (isEmpty && !isNextAvailable) {
                return null;
              }

              return (
                <ImagePlaceHolder
                  key={`slot-${slotId}`}
                  slotId={slotId}
                  image={image?.preview}
                  isMain={slotId === 0}
                  isFilled={isFilled}
                  onImageSelect={handleImageSelect}
                  onReplaceImage={handleReplaceImage}
                  onDeleteImage={handleDeleteImage}
                  setValue={setValue}
                  getValues={getValues}
                />
              );
            })}
          </div>
        </div>
        {/*product specifications*/}
        <div className="w-full  lg:flex gap-3 h-full px-2">
          {/*Left Column*/}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/*Title*/}
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300 ">
                Product Title *
              </label>
              <Input
                placeholder="Enter product title"
                {...register('title', {
                  required: 'Product Title is required',
                })}
                className="!bg-transparent text-white !border-gray-700 focus:ring-1 focus:ring-white focus:border-white"
              />
              {errors?.title && (
                <p className="text-red-500 text-sm">
                  {String(errors.title?.message)}
                </p>
              )}
            </div>
            {/*short-description*/}
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300 ">
                Short Description(max 150 words) *
              </label>
              <textarea
                placeholder="Enter product description for quick view"
                rows={5}
                {...register('short_Description', {
                  validate: (value) => {
                    const wordCount = value
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length;
                    return wordCount <= 150 || 'Maximum of 150 words allowed';
                  },
                })}
                className="w-full bg-transparent text-white placeholder-gray-400  border border-gray-700 rounded-md px-4 py-3  outline-none focus:border-white  transition "
              />
              {errors?.short_Description && (
                <p className="text-red-500 text-sm">
                  {String(errors.short_Description?.message)}
                </p>
              )}
            </div>
            {/*Tags*/}
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300 ">
                Tags *
              </label>
              <Input
                placeholder="apple,flagship"
                {...register('tags', {
                  required: 'Tags is required',
                  validate: (value) =>
                    Array.isArray(value) && value.length > 0
                      ? true
                      : 'Please enter at least one valid tag',
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
              {errors?.tags && (
                <p className="text-red-500 text-sm">
                  {String(errors.tags?.message)}
                </p>
              )}
            </div>
            {/*Warranty*/}
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300 ">
                Warranty *
              </label>
              <Input
                placeholder="1 year/No Warranty"
                {...register('warranty', {
                  required: 'Warranty is required',
                })}
                className="!bg-transparent text-white !border-gray-700 focus:ring-1 focus:ring-white focus:border-white"
              />
              {errors?.warranty && (
                <p className="text-red-500 text-sm">
                  {String(errors.warranty?.message)}
                </p>
              )}
            </div>
            {/*Slug*/}
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300 ">
                Slug *
              </label>
              <Input
                placeholder="product-slug"
                {...register('slug', {
                  required: 'Slug is required',
                  maxLength: {
                    value: 50,
                    message: 'Slug cannot exceed 50 characters',
                  },
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message:
                      'Slug must contain only lowercase letters, numbers and hyphens (no spaces)',
                  },
                  validate: (value) => {
                    if (value.startsWith('-') || value.endsWith('-')) {
                      return 'Slug cannot start or end with a hyphen';
                    }
                    return true;
                  },
                })}
                className="!bg-transparent text-white !border-gray-700 focus:ring-1 focus:ring-white focus:border-white"
              />
              {errors?.slug && (
                <p className="text-red-500 text-sm">
                  {String(errors.slug?.message)}
                </p>
              )}
            </div>
            {/*Brand*/}
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300 ">
                Brand
              </label>
              <Input
                placeholder="Apple"
                {...register('brand')}
                className="!bg-transparent text-white !border-gray-700 focus:ring-1 focus:ring-white focus:border-white"
              />
              {errors?.brand && (
                <p className="text-red-500 text-sm">
                  {String(errors.brand?.message)}
                </p>
              )}
            </div>
            <CustomColors name="colors" control={control as any} />
            <div>
              <CustomSpecifications
                name="custom_specification"
                control={control as any}
                register={register}
              />
            </div>
            <CustomProperties control={control as any} setValue={setValue as any} />
            {/* Starting Date */}
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300 ">
                Starting Date
              </label>
              <Controller
                control={control}
                name="starting_date"
                rules={{ required: 'Starting date is required' }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date: any) => field.onChange(date)}
                    showTimeSelect
                    dateFormat="yyyy-MM-dd HH:mm"
                    placeholderText="Select starting date"
                    className="bg-transparent !w-full p-2 text-white border !border-gray-700 focus:outline-none "
                  />
                )}
              />
              {errors.starting_date && (
                <span>{errors.starting_date.message}</span>
              )}
            </div>

            {/*Payment Method*/}
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300">
                Payment on Delivery *
              </label>
              <select
                {...register('cashOnDelivery', {
                  required: 'Payment option is required',
                })}
                className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-white"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {errors?.cashOnDelivery && (
                <p className="text-red-500 text-sm">
                  {String(errors.cashOnDelivery?.message)}
                </p>
              )}
            </div>
          </div>
          {/*Right Column*/}
          <div className="flex-1 min-w-0 flex flex-col gap-2 bg-black">
            {/*Category*/}
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300">
                Category *
              </label>
              <select
                {...register('category', { required: true })}
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
                <p className="text-red-500 text-sm mt-1">
                  Category is required
                </p>
              )}
            </div>
            {/* SubCategory */}
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300">
                Subcategory *
              </label>
              <select
                {...register('subCategory', { required: true })}
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
                <p className="text-red-500 text-sm mt-1">
                  Subcategory is required
                </p>
              )}
            </div>
            <RichTextEditor
              name="detailed_description"
              control={control}
              label="Detailed Description * (Min 100 words)"
              placeholder="Write full product details..."
              error={errors.detailed_description}
            />
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300">
                Video URL
              </label>
              <Input
                placeholder="https://www.youtube.com/embed/VIDEO_ID"
                {...register('video_url' as any, {
                  validate: (value: string) => {
                    if (!value) return true; // ✅ not required

                    const embedRegex =
                      /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}$/;

                    return (
                      embedRegex.test(value) ||
                      'Must be a valid YouTube embed URL'
                    );
                  },
                })}
                className="!bg-transparent text-white !border-gray-700 focus:ring-0 focus:border-gray-600"
              />
              {errors?.video_url && (
                <p className="text-sm text-red-500">
                  {String(errors.video_url.message)}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300 ">
                Regular Price
              </label>
              <Input
                placeholder="20$"
                {...register('regular_price', {
                  setValueAs: (value: string) => {
                    const numeric = value.replace(/[^\d.]/g, ''); // remove $, commas, letters
                    return numeric ? Number(numeric) : undefined;
                  },
                  validate: (value) =>
                    value === undefined || value > 0 || 'Enter a valid price',
                })}
                className="!bg-transparent text-white !border-gray-700 focus:ring-0 focus:border-gray-600"
              />
              {errors?.regular_price && (
                <p className="text-red-500 text-sm">
                  {String(errors.regular_price?.message)}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300 ">
                Sale Price *
              </label>
              <Input
                placeholder="15$"
                {...register('sale_price', {
                  required: 'Sale price is required',
                  setValueAs: (value: string) => {
                    const numeric = value.replace(/[^\d.]/g, ''); // remove $, commas, letters
                    return numeric ? Number(numeric) : undefined;
                  },
                  validate: (value) => {
                    const regularPrice = getValues('regular_price');
                    if (!value || value <= 0) {
                      return 'Enter a valid sale price';
                    }

                    if (regularPrice && value >= regularPrice) {
                      return 'Sale price must be lower than regular price';
                    }
                    return true;
                  },
                })}
                className="!bg-transparent text-white !border-gray-700 focus:ring-0 focus:border-gray-600"
              />
              {errors?.sale_price && (
                <p className="text-red-500 text-sm">
                  {String(errors.sale_price?.message)}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300 ">
                Stock *
              </label>
              <Input
                placeholder="100"
                {...register('stock', {
                  required: 'Stock is required',
                })}
                className="!bg-transparent text-white !border-gray-700 focus:ring-0 focus:border-gray-600"
              />
              {errors?.stock && (
                <p className="text-red-500 text-sm">
                  {String(errors.stock?.message)}
                </p>
              )}
            </div>
            {/* Ending Date */}
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300 ">
                Ending Date
              </label>
              <Controller
                control={control}
                name="ending_date"
                rules={{
                  required: 'Ending date is required',
                  validate: (value) => {
                    const start = getValues('starting_date');
                    if (!start) return 'Please select a starting date first';
                    if (value.getTime() === start.getTime()) {
                      return 'Ending date cannot be the same as starting date';
                    }
                    if (value.getTime() < start.getTime()) {
                      return 'Ending date cannot be before starting date';
                    }
                    return true; // valid
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date: any) => field.onChange(date)}
                    showTimeSelect
                    dateFormat="yyyy-MM-dd HH:mm"
                    placeholderText="Select ending date"
                    className="!w-full rounded-md p-2 bg-transparent text-white border border-gray-700 focus:outline-none"
                  />
                )}
              />
              {errors.ending_date && <span>{errors.ending_date.message}</span>}
            </div>
            <SizeSelector
              control={control}
              name="sizes"
              label="Sizes"
              error={errors.sizes}
            />
            <div>
              <label className="mb-1 block text-sm font-semibold !text-gray-300">
                Select Discount Code (Optional)
              </label>

              {isDiscountLoading && <Spinner />}

              {discountError && (
                <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-red-400">
                        Failed to load discount codes
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
              {/* Success State */}
              {!isDiscountLoading && !discountError && (
                <Controller
                  control={control}
                  name="discount_code"
                  defaultValue={[]}
                  render={({ field }) => {
                    const selectedCodes = field.value || [];

                    const toggleDiscount = (code: string) => {
                      if (selectedCodes.includes(code)) {
                        field.onChange(
                          selectedCodes.filter((c: string) => c !== code)
                        );
                      } else {
                        field.onChange([...selectedCodes, code]);
                      }
                    };

                    return (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {discounts.map((discount: Discount) => {
                            const isSelected = selectedCodes.includes(
                              discount.id //changed discountCode
                            );

                            return (
                              <button
                                type="button"
                                key={discount.id}
                                onClick={
                                  () => toggleDiscount(discount.id) //changed discountCode
                                }
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border
                                  ${isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                                  }`}
                              >
                                {discount.public_name}
                                <span className="ml-2 text-xs opacity-80">
                                  (
                                  {discount.discountType === 'Percentage'
                                    ? `${discount.discountValue}%`
                                    : `$${discount.discountValue}`}
                                  )
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {discounts.length === 0 && (
                          <p className="text-xs text-gray-500">
                            No discount codes available.
                          </p>
                        )}
                      </>
                    );
                  }}
                />
              )}
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                className="bg-gray-700 hover:bg-gray-600 transition text-white px-3 py-2 rounded-md"
              >
                Save Draft
              </button>
              <button
                disabled={isPending}
                type="submit"
                className="bg-blue-700 text-white px-3 hover:bg-blue-600 transition py-2 rounded-md"
              >
                {isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
export default CreateProduct;
