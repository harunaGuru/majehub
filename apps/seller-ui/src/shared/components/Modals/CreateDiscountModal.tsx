import React from 'react'
import { useForm } from 'react-hook-form';
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {PlusIcon, X } from 'lucide-react';
import {axiosInstance} from "@/utils/axiosInstance";

interface FormValues {
  discountCode: string;
  public_name: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
}
interface Props {
  open: boolean;
  onClose: () => void;
}
const CreateDiscountModal = ({open, onClose}:Props) => {
    const { register, handleSubmit, reset, formState:{errors} } = useForm<FormValues>();
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
      mutationFn: async (data: FormValues) => {
        const response = await axiosInstance.post(
          '/product/api/create-discount',
            data,
        );
        return response.data;
      },
      onSuccess: (data) => {
        if (data?.discount) {
          queryClient.invalidateQueries({
            queryKey: ['shop-discount'],
          });
        }
      },
    });
    const onSubmit = (values: FormValues) => {
      console.log(values);
      mutate(values, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    };
    if (!open) return null;
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 w-full">
        <div className="relative bg-gray-900 text-gray-300 p-6 rounded-lg w-[400px]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-semibold mb-5">Create Discount Code</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm mb-1">Title (Public Name)</label>
              <input
                {...register('public_name', {
                  required: 'Public name is required',
                })}
                className="w-full p-2 bg-gray-800 border border-gray-700 focus:outline-none"
              />
              {errors?.public_name && (
                <p className="text-red-500 text-sm">
                  {String(errors.public_name?.message)}
                </p>
              )}
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm mb-1">Discount Code</label>
              <input
                {...register('discountCode', {
                  required: 'Discount code is required',
                })}
                className="w-full p-2 bg-gray-800 border border-gray-700 focus:outline-none"
              />
              {errors?.discountCode && (
                <p className="text-red-500 text-sm">
                  {String(errors.discountCode?.message)}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm mb-1">Discount Type</label>
              <select
                {...register('discountType', {
                  required: 'Discount Type is required',
                })}
                className="w-full p-2 bg-gray-800 border border-gray-700 focus:outline-none"
              >
                <option className="text-sm" value="percentage">
                  PERCENTAGE (%)
                </option>
                <option className="text-sm" value="Flat">
                  FlAT AMOUNT($)
                </option>
              </select>
              {errors?.discountType && (
                <p className="text-red-500 text-sm">
                  {String(errors.discountType?.message)}
                </p>
              )}
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm mb-1">Discount Value</label>
              <input
                type="number"
                {...register('discountValue', {
                  required: 'Discount Value is required',
                })}
                className="w-full p-2 bg-gray-800 border border-gray-700 focus:outline-none"
              />
              {errors?.discountValue && (
                <p className="text-red-500 text-sm">
                  {String(errors.discountValue?.message)}
                </p>
              )}
            </div>

            {/* Buttons */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-medium"
            >
              <PlusIcon size={16} />
              {isPending ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      </div>
    );
}
export default CreateDiscountModal
