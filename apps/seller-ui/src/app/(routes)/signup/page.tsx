"use client"
import React from 'react'
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Input from '@/shared/components/customInput'
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { CountrySelect } from "@/shared/components/countriesSelect";
import CreateShop from '@/shared/components/createShop';
import StripeLogo from '@/assets/svgs/stripe-log0';

type FormValues = {
  name: string;
  email: string;
  phone_number: number;
  country: string;
  password: string;
};

type ApiError = {
  success: false;
  message: string;
  details?: unknown;
};

const SellerSignupPage = () => {
  const [active, setActive] = React.useState(1);
  const [formValues, setFormValues] = React.useState<FormValues | null>(null);
  const [showOtpInput, setShowOtpInput] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [otp, setOtp] = React.useState(['', '', '', '']);
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [OtpError, SetOtpError] = React.useState<string | null>(null);
  const [timer, setTimer] = React.useState(60);
  const [sellerId, setSellerId] = React.useState<string | null>(null);
  // const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      console.log(
        `Environment Variable: ${process.env.NEXT_PUBLIC_AUTH_URL}`
      );
      console.log('Data being sent:', data);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/seller-registration`,
        // 'http://127.0.0.1:8080/auth/api/seller-registration',
        data
      );
      return response.data;
    },
    onSuccess: (_, value: FormValues) => {
      console.log('User registered successfully:', value);
      setFormValues(value);
      setShowOtpInput(true);
      handleTimer();
      setServerError(null);
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response) {
        const apiError = axiosError.response.data;

        console.log(apiError.message);
        console.log(apiError?.details);
        setServerError(
          apiError.message || 'An error occurred during email verification.'
        );
      }
      console.error('Error during Email verification:', error);
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    loginMutation.mutate(data);
  };
  const OtpVerificationMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      name: string;
      password: string;
      phone_number: number;
      country: string;
      otp: string;
    }) => {
      console.log(data)
      if (!data.email || !data.name || !data.password || !data.phone_number || !data.country || !data.otp) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/seller-verification`,
        // `http://127.0.0.1:8080/auth/api/user-verification`,
        data
      );
      return response.data.seller.id;
    },
    onSuccess: (data, value) => {
      console.log("returned data", data)
      console.log('OTP verified successfully:', value);
      // Further actions after successful OTP verification can be added here
      setSellerId(data)
      setOtp(['', '', '', '']);
      setFormValues(null);
      setTimer(60);
      setShowOtpInput(false);
      setActive(2)
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response) {
        const apiError = axiosError.response.data;

        console.log(apiError.message); // "Invalid OTP"
        console.log(apiError?.details);
        // 400
        SetOtpError(
          apiError.message || 'An error occurred during OTP verification.'
        );
      }
      console.error('Error during OTP verification:', error);
    },
  });

  const resendOtp = () => {
    if (!formValues) return;
    loginMutation.mutate(formValues);
  };
  const handleTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const setShopData = (value: any) => {
    console.log(value);
  }

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
    // Logic to verify OTP can be added here
    const otpString = otp.join('');
    console.log('Verifying OTP:', otpString);
    OtpVerificationMutation.mutate({
      email: formValues?.email!,
      name: formValues?.name!,
      password: formValues?.password!,
      phone_number: formValues?.phone_number!,
      country: formValues?.country!,
      otp: otpString,
    });
  };

  const createStripeLink = async () => {
    try {
      console.log(sellerId)
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/create-stripe-link`,
        { sellerId }
      );
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.log('stripe connection error', error);
    }

  }
  return (
    <div className="w-full min-h-screen flex flex-col items-center  pt-6">
      <div className="md:w-[50%] w-full px-4 mb-8 flex items-center justify-between relative">
        <div className="absolute w-[80%] md:w-[80%] left-11 top-[25%] h-1 bg-gray-300 -z-10" />
        {[1, 2, 3].map((step) => {
          return (
            <div key={step}>
              <div
                className={`rounded-full font-bold flex items-center justify-center text-white h-8 w-8  ${step <= active ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
              >
                {step}
              </div>
              <span className="font-poppins md:-ml-5 text-lg font-semibold">
                {step === 1
                  ? 'Create Account'
                  : step === 2
                    ? 'Setup Shop'
                    : 'Connect Bank'}
              </span>
            </div>
          );
        })}
      </div>
      {/*min-h-[250px]*/}
      <div className="md:w-[33vw] w-full mt-6  bg-white p-7 rounded-md shadow-2xl flex flex-col items-center">
        {active === 1 ? (
          <>
            <h2 className="text-center font-poppins font-semibold text-2xl mb-2">
              Create Account
            </h2>

            {!showOtpInput ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full flex flex-col gap-4"
              >
                <div>
                  <Input
                    label="Name"
                    placeholder="haroon"
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
                    placeholder="hishow@gmail.com"
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
                <div>
                  <Input
                    type="tel"
                    label="Phone Number"
                    inputMode="numeric"
                    placeholder="e.g. 8012345678"
                    {...register('phone_number', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]+$/,
                        message: 'Only numbers are allowed',
                      },
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, '');
                      },
                    })}
                  />

                  {errors.phone_number && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone_number.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <CountrySelect
                    label="Country"
                    name="country"
                    control={control}
                    error={errors.country?.message as string}
                  />
                </div>

                <div className="w-full relative ">
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium !text-gray-900 dark:text-gray-300"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6. characters"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message:
                          'Password must be at least 6 characters long',
                      },
                    })}
                  />
                  <button
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
                  // disabled={loginMutation.isPending}
                  type="submit"
                  className="w-full font-poppins bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  {/*Sign Up*/}
                  {loginMutation.isPending ? 'Signing Up...' : 'Sign Up'}
                </button>
                <p className="text-gray-600 font-roboto text-center text-sm mb-4">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-blue-500 hover:underline"
                  >
                    Login
                  </Link>
                </p>
                {serverError && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    {serverError}
                  </p>
                )}
              </form>
            ) : (
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
                    OtpVerificationMutation.isPending
                  }
                  onClick={handleOTP}
                  className="w-full font-poppins bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  {OtpVerificationMutation.isPending
                    ? 'Verifying OTP...'
                    : 'Verify OTP'}
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
          </>
        ) : active === 2 ? (
          <CreateShop
            sellerId={sellerId}
            setActive={setActive}
            setShopData={setShopData}
            setServerError={setServerError}
          />
        ) : (
          <div className="w-full ">
            <h2 className="text-center font-poppins font-semibold text-2xl mb-2">
              Withdraw Method
            </h2>
            <button
              type="button"
              onClick={createStripeLink}
              className="w-full mt-3 font-poppins bg-[#334155] text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              Connect Stripe
              <StripeLogo />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default SellerSignupPage