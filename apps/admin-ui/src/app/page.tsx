'use client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';

type FormValues = {
  name: string;
  email: string;
  password: string;
};
type ApiError = {
  success: false;
  message: string;
  details?: any;
};

const Index = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/admin/api/login-admin`,
        // 'http://localhost:8080/admin/api/login-admin',
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          xsrfCookieName: 'XSRF-TOKEN',
          xsrfHeaderName: 'X-XSRF-TOKEN',
        }
      );
      return response.data;

    },
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response) {
        const apiError = axiosError.response.data;
        setServerError(apiError.message || 'An error occurred during Login.');
      }
    },
  });
  const onSubmit = (data: FormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full bg-[#090D19]">
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-5 px-4 text-white">
        <div className="w-full max-w-[440px]  p-5 sm:p-7 rounded-md shadow-md flex flex-col items-center">
          {/* Login form elements will go here */}
          <h2 className="text-center font-poppins font-bold text-2xl mb-2">
            Welcome Admin
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4"
          >
            <div className='w-full'>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-300 dark:text-gray-300"
              >
                Email
              </label>
              <input
                type="email"
                placeholder="hishow@gmail.com"
                className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message as string}
                </p>
              )}
            </div>
            <div className="w-full relative ">
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-300 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6. characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
                })}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-8 right-2 cursor-pointer text-gray-500"
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message as string}
                </p>
              )}
            </div>
            <button
              disabled={loginMutation.isPending}
              type="submit"
              className="w-full font-poppins bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              {loginMutation.isPending ? 'login in.....' : 'login'}
            </button>
            {serverError && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {serverError}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
