"use client"
import { axiosInstance } from '@/utils/axiosInstance'
import { isProtected } from '@/utils/isProtected'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from "@stripe/react-stripe-js";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'
import CheckoutForm from '@/app/shared/components/CheckoutForm';

const stripePromise = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState("")
  const [cart, setCart] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [coupon, setCoupon] = useState<any | null>(null)
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const sessionId = useSearchParams().get("sessionId")
  if (!sessionId) {
    toast.error("Session not found")
    router.push("/")
    return null
  }
  useEffect(() => {
    const fetchSessionAndClientSecret = async () => {
      if (!sessionId) return;

      try {
        setLoading(true);

        const res = await axiosInstance.get(
          `/order/api/verify-payment-session?sessionId=${sessionId}`,
          isProtected()
        );

        const { session } = res.data;
        const { cart, sellers, totalAmount, shippingAddressId, coupon } = session;

        setCart(cart);
        setTotalAmount(totalAmount);
        setCoupon(coupon);

        const firstSellerStripeId = sellers[0]?.stripeAccountId;

        if (!firstSellerStripeId || !totalAmount || !shippingAddressId) {
          toast.error("Payment session is not valid");
          router.push("/");
          return;
        }
        const finalAmount =
          coupon?.discountedProductId
            ? totalAmount - (coupon.discountAmount || 0)
            : totalAmount;
        const { data } = await axiosInstance.post(
          '/order/api/payment-intent',
          {
            sessionId,
            stripeCustomerId: firstSellerStripeId,
            amount: finalAmount,
          },
          isProtected()
        );
        if (!data.clientSecret) {
          throw new Error('Payment session is not valid');
        }

        setClientSecret(data.clientSecret);

      } catch (error: any) {
        setServerError(error.message || "Failed to process payment session");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndClientSecret();
  }, [sessionId]);
  if (loading) {
    return <div className='flex justify-center items-center h-[70vh]'>
      <Loader2 className='animate-spin' />
      <span className='ml-2'>Loading...</span>
    </div>
  }
  if (serverError) {
    return <div className='flex justify-center items-center h-[70vh] text-red-500'>
      <X />
      {serverError}</div>
  }
  if (!clientSecret) return null;
  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 p-6">

      {/* LEFT: Order Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        {cart.map((item: any) => {
          const price = item.product.sale_price;
          const qty = item.product.quantity;
          const total = price * qty;

          let discount = 0;
          if (coupon?.discountedProductId === item.product.id) {
            discount = coupon.discountAmount || 0;
          }

          return (
            <div key={item.product.id} className="flex gap-4 mb-4">
              <img src={item.product.image} className="w-16 h-16 rounded-md" />
              <div className="flex-1">
                <p className="font-medium">{item.product.title}</p>
                <p className="text-sm text-gray-500">Qty: {qty}</p>

                {discount > 0 && (
                  <p className="text-green-600 text-sm">
                    -${discount.toLocaleString()}
                  </p>
                )}
              </div>
              <p className="font-semibold">
                ${(total - discount).toLocaleString()}
              </p>
            </div>
          );
        })}

        <hr className="my-4" />

        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>
            $
            {(
              coupon?.discountedProductId
                ? totalAmount - (coupon.discountAmount || 0)
                : totalAmount
            ).toLocaleString()}
          </span>
        </div>
      </div>

      {/* RIGHT: Payment */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Secure Payment Checkout</h2>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#000",
                borderRadius: "8px",
              },
            },
          }}
        >
          <CheckoutForm sessionId={sessionId} />
        </Elements>
      </div>
    </div>
  )
}

export default CheckoutPage