"use client";

import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { useStore } from "@/store";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axiosInstance";
import { isProtected } from "@/utils/isProtected";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
  } = useStore();

  const [coupon, setCoupon] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountedProductId, setDiscountedProductId] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const router = useRouter()

  const userId = cart[0]?.userInfo?.id;
  const loading = false

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["user-address"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/user/api/get-user-address", isProtected())
      return data.data
    }
  })

  //create payment-session
  const { mutateAsync: createPaymentSession, isPending: isCreatingPaymentSession } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/order/api/create-payment-session", {
        cart,
        coupon: {
          code: appliedCouponCode,
          discountPercent: discount,
          discountAmount,
          discountedProductId: discountedProductId || null,
        },
        selectedAddressId: selectedAddress,
      }, isProtected())
      return data
    },
    onSuccess: (data) => {
      router.push(`/checkout?sessionId=${data.sessionId}`)
    },
    onError: (error) => {
      console.log(error)
    }
  })

  const handleCreatePaymentSession = () => {
    createPaymentSession()
  }

  const { mutateAsync: applyCoupon, isPending: isApplyingCoupon } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/order/api/apply-coupon", {
        couponCode: coupon,
        cart,
      }, isProtected())
      return data
    },
    onSuccess: (data) => {
      if (data.valid) {
        toast.success(data.message)
        setDiscount(data.discount)
        setDiscountAmount(data.discountAmount)
        setDiscountedProductId(data.discountedProductId)
        setAppliedCouponCode(coupon);
        setCouponApplied(true);
        setCoupon("")
      } else {
        toast.error(data.message)
        setDiscount(0)
        setDiscountAmount(0)
        setDiscountedProductId("")
        setCouponApplied(false);
        setAppliedCouponCode("");
      }
    },
    onError: (error) => {
      toast.error("Failed to apply coupon. Please try again.");
      setDiscount(0);
      setDiscountAmount(0);
      setCouponApplied(false);
    }
  })

  const handleApplyCoupon = () => {
    if (!coupon.trim()) return;
    applyCoupon()

  }

  // const handleRemoveCoupon = () => {
  //   setDiscount(0);
  //   setDiscountAmount(0);
  //   setDiscountedProductId("");
  //   setCouponApplied(false);
  //   setAppliedCouponCode("");
  //   setCoupon("");
  // };

  useEffect(() => {
    if (addresses?.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((addr: any) => addr.isDefault)
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id)
      }
    }
  }, [addresses, selectedAddress])
  console.log("cart", cart)
  const subtotal = useMemo(() => {
    return cart.reduce(
      (acc, item) =>
        acc + (item?.product?.sale_price || item?.product?.price || 0) * item?.product?.quantity,
      0
    );
  }, [cart]);

  const total = subtotal - discountAmount;

  return (
    <div className="bg-gray-100 w-full min-h-screen">
      <div className="w-[90%] lg:w-[80%] mx-auto py-10">
        <h1 className="text-3xl font-semibold text-gray-900 font-poppins">Cart</h1>
        {/*BreadCrumbs*/}
        <div className="flex gap-1 items-baseline mb-10">
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 cursor-pointer"
          >
            Home
          </Link>
          <span className="p-0.5 h-1 bg-gray-500 rounded-full"></span>
          <span className="text-sm font-medium text-gray-500">
            Cart
          </span>
        </div>
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center">Your cart is empty</p>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Table */}
            <div className="lg:w-[70%] w-full overflow-x-auto rounded-xl">
              <table className="w-full">
                <thead className="bg-gray-200 text-sm">
                  <tr>
                    <th className="p-4 text-left w-[60%]">Product</th>
                    <th className="p-4 text-left">Price</th>
                    <th className="p-4 text-left">Quantity</th>
                    <th className="p-4 text-left"></th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item) => {
                    const { product, userInfo, location, deviceInfo } = item;

                    return (
                      <tr key={product.id} className=" hover:bg-gray-50 rounded-xl transition text-sm">
                        {/* PRODUCT */}
                        <td className="p-3 flex items-center gap-4">
                          <div className="relative w-12 h-12">
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <span>{product.title}</span>
                        </td>

                        {/* PRICE */}
                        <td className="p-3">
                          ${(product?.sale_price || product?.price || 0)?.toFixed(2)}
                        </td>

                        {/* QUANTITY */}
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                updateCartQuantity(product.id, "dec")
                              }
                              className="w-8 h-8"
                            >
                              -
                            </button>

                            <span>{product.quantity}</span>

                            <button
                              onClick={() =>
                                updateCartQuantity(product.id, "inc")
                              }
                              className="w-8 h-8"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="p-3">
                          <button
                            onClick={() =>
                              removeFromCart(
                                product,
                                userInfo,
                                location,
                                deviceInfo
                              )
                            }
                            className="text-red-500 "
                          >
                            <X size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Right */}
            <div className="lg:w-[30%] w-full bg-stone-200 p-6 border border-gray-200 rounded-xl h-fit space-y-6">
              {/* SUBTOTAL */}
              <div className="flex justify-between font-semibold text-gray-900 font-poppins">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {/* COUPON */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-900 font-poppins">
                  Have a coupon?
                </span>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter coupon code"
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                      disabled={couponApplied || isApplyingCoupon}
                    />
                    {coupon && !couponApplied && (
                      <button
                        onClick={() => setCoupon('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleApplyCoupon}
                    disabled={!coupon.trim() || couponApplied || isApplyingCoupon}
                    className={`px-6 py-2 rounded-md font-medium text-sm transition-all duration-200
                      ${!coupon.trim() || couponApplied || isApplyingCoupon
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'
                      }
                    `}
                  >
                    {isApplyingCoupon ? "Applying..." : "Apply"}
                  </button>
                </div>

                {/* ADDRESS */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-900 font-poppins">
                    Shipping Address
                  </span>
                  {isLoading ? (
                    <p className='text-sm text-gray-500'>Loading Addresses...</p>
                  ) : addresses?.length === 0 ? (
                    <p className='text-sm text-gray-500'>Go to your profile to add an address</p>
                  ) : (
                    <select
                      value={selectedAddress}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="border p-2 rounded-md"
                    >
                      {addresses?.map((addr: any) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label}-{addr.city}, {addr.country}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* PAYMENT */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-900 font-poppins">
                    Select Payment Method
                  </span>

                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                    className="border p-2 rounded-md"
                  >
                    {/* <option value="">Select method</option> */}
                    <option>Credit Card</option>
                    <option>Paypal</option>
                    <option>Bank Transfer</option>
                    <option>Cash On Delivery</option>
                  </select>
                </div>

                {/* TOTAL */}
                <div className="flex justify-between font-semibold text-lg font-poppins">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {/* CHECKOUT */}
                <button onClick={handleCreatePaymentSession} disabled={isCreatingPaymentSession} className="w-full bg-black flex gap-2 items-center justify-center text-white py-3 rounded-lg hover:bg-gray-800 transition">
                  {isCreatingPaymentSession && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isCreatingPaymentSession ? "Redirecting" : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}