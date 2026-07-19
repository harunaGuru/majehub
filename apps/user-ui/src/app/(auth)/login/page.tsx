'use client';
import Input from '@/app/shared/components/customInput';
import GoogleButton from '@/app/shared/components/googleButton';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
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

const LoginPage = () => {
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
        `${process.env.NEXT_PUBLIC_AUTH_URL}/auth/api/user-login`,
        // "http://localhost:8080/auth/api/user-login",
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push('/');
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
    <div className="w-full bg-[#f1f1f1] min-h-[90vh]">
      <div className="w-full flex flex-col items-center justify-center h-full py-6 px-4">
        <h1 className="text-center font-poppins font-bold mb-2 text-2xl sm:text-3xl">
          Login
        </h1>
        <div className="flex gap-1 items-baseline mb-4">
          <span className="text-sm font-medium text-gray-500">Home</span>
          <span className="p-0.5 h-1 bg-gray-500 rounded-full"></span>
          <span className="text-sm font-medium text-gray-500">Login</span>
        </div>
        <div className="w-full max-w-[440px] bg-white p-5 sm:p-7 rounded-md shadow-md flex flex-col items-center">
          <h2 className="text-center font-poppins font-semibold text-xl sm:text-2xl mb-2">
            Login To Majehub
          </h2>
          <p className="text-gray-600 font-roboto text-center text-sm mb-4">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
          <GoogleButton />
          <div className="flex items-center justify-between gap-1 my-5 w-full">
            <div className="flex-1 h-0.5 bg-gray-300 rounded-md" />
            <span className="text-gray-500 text-xs font-semibold whitespace-nowrap px-2">
              Or Signin with Email
            </span>
            <div className="flex-1 h-0.5 bg-gray-300 rounded-md" />
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4"
          >
            <div>
              <Input
                type="email"
                label="Email"
                placeholder="johndoe@gmail.com"
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
            <div className="w-full relative">
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-8 right-2 cursor-pointer text-gray-500"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message as string}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <input
                  className="h-3.5 w-3.5 rounded cursor-pointer"
                  type="checkbox"
                  id="remember-me"
                />
                <label htmlFor="remember-me" className="font-poppins text-sm">Remember me</label>
              </div>
              <Link
                className="text-blue-500 text-sm font-poppins"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
            <button
              disabled={loginMutation.isPending}
              type="submit"
              className="w-full font-poppins bg-black text-white py-2.5 rounded-md hover:bg-black/75 transition-colors text-sm"
            >
              {loginMutation.isPending ? 'Logging in…' : 'Login'}
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

export default LoginPage;
