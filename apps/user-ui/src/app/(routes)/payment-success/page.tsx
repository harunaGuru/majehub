"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { CheckCircle, Truck } from "lucide-react";
import { useStore } from "@/store"; // adjust path

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("sessionId");

  const clearCart = useStore((state) => state.clearCart);

  useEffect(() => {
    // Confetti burst
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Clear cart
    clearCart();
  }, []);

  return (
    <div className="min-h-[70vh] bg-gray-100 flex items-center justify-center px-4">

      <div className="bg-white max-w-sm w-full rounded-2xl shadow-lg p-6  text-center flex flex-col items-center">

        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-xl font-semibold mb-3">
          Payment Successful 🎉
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        <button
          onClick={() => router.push(`/order/${sessionId}`)}
          className="px-4 py-2 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-md hover:opacity-90 transition"
        >
          <Truck size={18} />
          Track Order
        </button>

        <button
          onClick={() => router.push("/")}
          className="mt-4 text-sm text-gray-500 hover:underline"
        >
          Continue Shopping
        </button>
        <div>
          {sessionId && (
            <span className="font-medium text-gray-500 text-sm">
              Session ID: <span className="break-all font-normal">{sessionId}</span>
            </span>

          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;