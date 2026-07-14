import React from 'react';
import Input from '@/shared/components/customInput';
import { useForm } from 'react-hook-form';
import { shopCategories } from '@/config/categories';
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type FormValues = {
  name: string;
  bio: string;
  address: number;
  opening_hours: string;
  website?: string;
  category: string;
  sellerId?: string;
};
type ApiError = {
  success: false;
  message: string;
  details?: unknown;
};
type ShopdataProps = {
  sellerId: string | null;
  setActive: (active: number) => void;
  setShopData: (value: FormValues) => void;
  setServerError: (error: string | null) => void;
}

const CreateShop = ({ sellerId, setActive, setShopData, setServerError }: ShopdataProps) => {
  if (!sellerId) return;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const handleSeller = (value: FormValues) => {
    setShopData(value)
  }

  const createShopMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const datas: any = { ...data, sellerId: sellerId };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/auth/api/create-shop`,
        datas
      );
      return response.data;
    },
    onSuccess: (_, value: any) => {
      setActive(3)
      handleSeller((value))

    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response) {
        const apiError = axiosError.response.data;
        setServerError(
          apiError.message || 'An error occurred during email verification.'
        );
      }
      console.error('Error during Email verification:', error);
    },

  });
  const onsubmit = (values: FormValues) => {
    createShopMutation.mutate(values);
  }
  return (
    <>
      <h2 className="text-center font-poppins font-semibold text-2xl mb-2">
        Create Account
      </h2>
      <form
        onSubmit={handleSubmit(onsubmit)}
        className="w-full flex flex-col gap-4"
      >
        <div>
          <Input
            label="Name *"
            placeholder="Haroon"
            {...register('name', { required: 'Shop Name is required' })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.name.message as string}
            </p>
          )}
        </div>
        <div>
          <Input
            label="Bio (Max 100 words) *"
            placeholder="shop bio"
            {...register('bio', {
              required: 'Shop Name is required',
              validate: (value: string) => {
                const wordCount = value
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length;

                return wordCount <= 100 || 'Maximum of 100 words allowed';
              },
            })}
          />
          {errors.bio && (
            <p className="text-red-500 text-xs mt-1">
              {errors.bio.message as string}
            </p>
          )}
        </div>
        <div>
          <Input
            label="Address *"
            placeholder="shop location"
            {...register('address', { required: 'Shop location is required' })}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">
              {errors.address.message as string}
            </p>
          )}
        </div>
        <div>
          <Input
            label="Opening Hours *"
            placeholder="e.g Mon-Fri 9am-6pm"
            {...register('opening_hours', {
              required: 'Opening Hours is required',
            })}
          />
          {errors.opening_hours && (
            <p className="text-red-500 text-xs mt-1">
              {errors.opening_hours.message as string}
            </p>
          )}
        </div>
        <div>
          <Input
            label="Website"
            placeholder="https://example.com"
            {...register('website', {
              pattern: {
                value: /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/.*)?$/,
                message:
                  'Please enter a valid website URL (e.g. https://example.com)',
              },
            })}
          />
          {errors.website && (
            <p className="text-red-500 text-xs mt-1">
              {errors.website.message as string}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="category"
            className="mb-1 block text-sm font-semibold text-gray-900 dark:text-gray-300"
          >
            Category *
          </label>
          <select
            id="category"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('category', { required: 'Category is required' })}
          >
            <option value="">Select a category</option>
            {shopCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <button disabled={createShopMutation.isPending}
          type="submit"
          className="w-full font-poppins bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          {createShopMutation.isPending ? "creating shop..." : "create"}
        </button>
      </form>
    </>
  );
};
export default CreateShop;
