'use client';
import Input from '@/shared/components/customInput';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';

type Errors = {
  newPassword?: string;
  confirmPassword?: string;
};

type ApiError = {
  success: false;
  message: string;
  details?: any;
};
type sets = 'email' | 'otp' | 'password';

const ForgotPasswordPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [step, setSteps] = useState<sets>('email');
  const [email, setEmail] = useState('');
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [otp, setOtp] = React.useState(['', '', '', '']);
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const [OtpError, SetOtpError] = React.useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = React.useState(60);
  const router = useRouter();
  const [error, setError] = useState<Errors>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/auth/api/forgot-seller-password`,
        // 'http://localhost:8080/auth/api/forgot-password',
        data
      );
      return response.data;
    },
    onSuccess: (_, data) => {
      setEmail(data.email);
      setSteps('otp');
      handleTimer();
      setServerError(null);
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response) {
        const apiError = axiosError.response.data;

        setServerError(apiError.message || 'An error occurred during Login.');
      }
    },
  });

  const resetOtpMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/auth/api/verify-forgot-seller-password-otp`,
        data
      );
      return response.data;
    },
    onSuccess: (_, data) => {
      setEmail(data.email);
      setSteps('password');
      SetOtpError(null);
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response) {
        const apiError = axiosError.response.data;

        SetOtpError(
          apiError.message || 'An error occurred during Otp verification.'
        );
      }
    },
  });

  const handleOTP = () => {
    // Logic to verify OTP can be added here
    const otpString = otp.join('');
    resetOtpMutation.mutate({
      email: email,
      otp: otpString,
    });
  };

  const resendOtp = () => {
    if (!email) return;
    forgotPasswordMutation.mutate({ email });
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

  const onSubmit = (data: { email: string }) => {
    forgotPasswordMutation.mutate(data);
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

  //third steps

  const passwordResetMutation = useMutation({
    mutationFn: async (data: { email: string; newPassword: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/auth/api/reset-seller-password`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setServerError(null);
      router.push('/login');
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response) {
        const apiError = axiosError.response.data;

        setServerError(
          apiError.message || 'An error occurred while resetting Otp.'
        );
      }
    },
  });
  const validate = (): boolean => {
    const nextErrors: Errors = {};

    if (!newPassword) {
      nextErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setError(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    // ✅ Safe, validated data
    const payload = {
      newPassword,
      confirmPassword,
    };
    const data = { email: email, newPassword: payload.newPassword };
    passwordResetMutation.mutate(data);
  };

  return (
    <div className="w-full h-full min-h-[450px] bg-[#f1f1f1]  pb-4">
      <div className="w-full flex flex-col items-center justify-center h-full py-5">
        <h1 className="text-center font-poppins font-bold mb-2 text-3xl">
          Forgot Password
        </h1>
        <div className="flex gap-1 items-baseline mb-3">
          <Link href="/" className="text-sm font-medium text-gray-500">
            Home
          </Link>
          <span className="p-0.5 h-1 bg-gray-500 rounded-full"></span>
          <span className="text-sm font-medium text-gray-500">
            Forgot-Password
          </span>
        </div>
        <p className="text-gray-600 font-roboto text-center text-sm mb-4">
          Go back to?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
        <div className="w-[25vw] h-fit bg-white p-5 rounded-md shadow-md flex flex-col items-center">
          {/* Login form elements will go here */}
          <h2 className="text-center font-poppins font-semibold text-2xl mb-2">
            Login To Majehub
          </h2>
          {step === 'email' && (
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
              <button
                disabled={forgotPasswordMutation.isPending}
                type="submit"
                className="w-full font-poppins bg-black text-white py-2 rounded-md hover:bg-black/75 transition-colors"
              >
                {forgotPasswordMutation.isPending
                  ? 'submitting.....'
                  : 'submit'}
              </button>
              {serverError && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {serverError}
                </p>
              )}
            </form>
          )}
          {step === 'otp' && (
            <>
              <h3 className="text-center font-bold font-poppins text-lg mb-3">
                Enter OTP
              </h3>
              {/* OTP input fields can be added here */}
              <div className="flex justify-center gap-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onChange={(e) => handleChange(e.target.value, index)}
                    className="w-10 h-10 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={
                  otp.some((digit) => digit === '') ||
                  resetOtpMutation.isPending
                }
                onClick={handleOTP}
                className="w-full font-poppins bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                {resetOtpMutation.isPending ? 'Verifying OTP...' : 'Verify OTP'}
              </button>
              <p className="text-center text-sm mt-2 font-medium font-roboto">
                {timer > 0 ? (
                  `Resend OTP in ${timer}s`
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
          {step === 'password' && (
            <form
              className="w-full flex flex-col gap-4"
              onSubmit={handlePasswordSubmit}
              noValidate
            >
              {/* New Password */}
              <div className="w-full relative">
                <label
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="newPassword"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={validate}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-8 right-2 cursor-pointer text-gray-500"
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
                {error.newPassword && (
                  <p className="error">{error.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="w-full relative">
                <label
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={validate}
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-8 right-2 cursor-pointer text-gray-500"
                >
                  {showConfirmPassword ? <Eye /> : <EyeOff />}
                </button>
                {error.confirmPassword && (
                  <p className="error">{error.confirmPassword}</p>
                )}
              </div>

              <button
                className="w-full font-poppins bg-black text-white py-2 rounded-md hover:bg-black/75 transition-colors"
                type="submit"
              >
                {passwordResetMutation.isPending
                  ? 'Resetting Pasword...'
                  : 'Reset Password'}
              </button>
              {serverError && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {serverError}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
