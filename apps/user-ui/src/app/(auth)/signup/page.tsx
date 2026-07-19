'use client';
import Input from '@/app/shared/components/customInput';
import GoogleButton from '@/app/shared/components/googleButton';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

type FormValues = {
  name: string;
  email: string;
  password: string;
};

type ApiError = {
  success: false;
  message: string;
  details?: unknown;
};

const SignUpPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [formValues, setFormValues] = React.useState<FormValues | null>(null);
  const [otp, setOtp] = React.useState(['', '', '', '']);
  const [showOtpInput, setShowOtpInput] = React.useState(false);
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [OtpError, SetOtpError] = React.useState<string | null>(null);
  const [timer, setTimer] = React.useState(60);
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/auth/api/user-registration`,
        // 'http://localhost:8080/auth/api/user-registration',
        data
      );
      return response.data;
    },
    onSuccess: (_, value) => {
      setFormValues(value);
      setShowOtpInput(true);
      handleTimer();
      setServerError(null);
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response) {
        const apiError = axiosError.response.data;
        setServerError(
          apiError.message || 'An error occurred during email verification.'
        );
      }
    },
  });

  const OtpVerificationMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      name: string;
      password: string;
      otp: string;
    }) => {
      if (!data.email || !data.name || !data.password || !data.otp) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/auth/api/user-verification`,
        // 'http://localhost:8080/auth/api/user-verification',
        data
      );
      return response.data;
    },
    onSuccess: (_, value) => {
      setOtp(['', '', '', '']);
      setFormValues(null);
      setTimer(60);
      setShowOtpInput(false);
      router.push('/login');
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response) {
        const apiError = axiosError.response.data;
        // 400
        SetOtpError(
          apiError.message || 'An error occurred during OTP verification.'
        );
      }
    },
  });

  const resendOtp = () => {
    if (!formValues) return;
    loginMutation.mutate(formValues);
  };

  const handleTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setTimer(60);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    loginMutation.mutate(data);
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (!inputRefs.current) return;
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOTP = () => {
    const otpString = otp.join('');
    OtpVerificationMutation.mutate({
      email: formValues?.email!,
      name: formValues?.name!,
      password: formValues?.password!,
      otp: otpString,
    });
  };

  return (
    <div className="w-full bg-[#f1f1f1] min-h-[85vh]">
      <div className="w-full flex flex-col items-center justify-center h-full py-6 px-4">
        <h1 className="text-center font-poppins font-bold mb-2 text-2xl sm:text-3xl">
          Signup
        </h1>
        <div className="flex gap-1 items-baseline mb-4">
          <span className="text-sm font-medium text-gray-500">Home</span>
          <span className="p-0.5 h-1 bg-gray-500 rounded-full"></span>
          <span className="text-sm font-medium text-gray-500">Signup</span>
        </div>
        <div className="w-full max-w-[440px] bg-white p-5 sm:p-7 rounded-md shadow-md flex flex-col items-center">
          <h2 className="text-center font-poppins font-semibold text-xl sm:text-2xl mb-2">
            Create an Account
          </h2>
          <p className="text-gray-600 font-roboto text-center text-sm mb-4">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
          <GoogleButton />
          <div className="flex items-center justify-between gap-1 my-5 w-full">
            <div className="flex-1 h-0.5 bg-gray-300 rounded-md" />
            <span className="text-gray-500 text-xs font-semibold whitespace-nowrap px-2">
              Or Signup with Email
            </span>
            <div className="flex-1 h-0.5 bg-gray-300 rounded-md" />
          </div>
          {!showOtpInput ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex flex-col gap-4"
            >
              <div>
                <Input
                  label="Name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  label="Email"
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
              <button
                disabled={loginMutation.isPending}
                type="submit"
                className="w-full font-poppins bg-blue-500 text-white py-2.5 rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                {loginMutation.isPending ? 'Signing Up…' : 'Sign Up'}
              </button>
              {serverError && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {serverError}
                </p>
              )}
            </form>
          ) : (
            <>
              <h3 className="text-center font-bold font-poppins text-lg mb-2">
                Enter OTP
              </h3>
              <p className="text-gray-500 text-sm text-center mb-4">
                We sent a 4-digit code to your email
              </p>
              <div className="flex justify-center gap-3 mb-5">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onChange={(e) => handleChange(e.target.value, index)}
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg font-semibold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={
                  otp.some((digit) => digit === '') ||
                  OtpVerificationMutation.isPending
                }
                onClick={handleOTP}
                className="w-full font-poppins bg-blue-500 text-white py-2.5 rounded-md hover:bg-blue-600 transition-colors text-sm disabled:opacity-60"
              >
                {OtpVerificationMutation.isPending
                  ? 'Verifying OTP…'
                  : 'Verify OTP'}
              </button>
              <p className="text-center text-sm mt-3 font-medium font-roboto">
                {timer > 0 ? (
                  <span className="text-gray-500">Resend OTP in <span className="text-blue-500 font-bold">{timer}s</span></span>
                ) : (
                  <button
                    onClick={resendOtp}
                    className="text-blue-500 underline"
                  >
                    Resend OTP
                  </button>
                )}
              </p>
              {OtpError && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {OtpError}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
