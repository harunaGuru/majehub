import { useUser } from '@/hooks/useUser'
import React from 'react'
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axiosInstance";
import { isProtected } from '@/utils/isProtected';

type FormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};


const ChangePassword = () => {
  const { user } = useUser()
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>();
  const newPassword = watch("newPassword");

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { email: string; newPassword: string }) => {
      const res = await axiosInstance.post("/auth/api/reset-password", data, isProtected());
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Password updated successfully");
      reset();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update password"
      );
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!user?.email) {
      toast.error("User not found");
      return;
    }

    mutate({
      email: user.email,
      newPassword: data.newPassword,
    });
  };
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Change Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className='max-w-96 mx-auto'>
        <div className="mb-4">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            placeholder='Enter current password'
            {...register("currentPassword", {
              required: "Current password is required",
            })}
            className="mt-1 block w-full p-2 rounded-md border border-gray-700"
          />
          {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            placeholder='Enter new password'
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className="mt-1 block w-full border rounded-md p-2 border-gray-700"
          />
          {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder='Re-enter new password'
            id="confirmPassword"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === newPassword || "Passwords do not match",
            })}
            className="mt-1 block border p-2 w-full rounded-md border-gray-700 "
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className={`inline-flex w-full justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isPending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}`}
        >
          {isPending ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  )
}

export default ChangePassword