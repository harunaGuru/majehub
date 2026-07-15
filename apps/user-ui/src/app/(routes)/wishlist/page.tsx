"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Link from "next/link";
import { useAuthUser } from "@/hooks/useAuthUser";
export default function WishlistPage() {
  const router = useRouter();
  const { user } = useAuthUser()

  const {
    wishlist,
    addToCart,
    removeFromWishlist,
    updateWishlistQuantity,
  } = useStore();
  const userWishlist = wishlist.filter((item) => item.userInfo.id === user?.id)

  return (
    <div className="bg-gray-100 w-full min-h-screen">
      <div className="w-[90%] lg:w-[80%] mx-auto py-10">
        <h1 className="text-3xl font-semibold text-gray-900 font-poppins">
          Wishlist
        </h1>
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
            Wishlist
          </span>
        </div>
        {userWishlist.length === 0 ? (
          <p className="text-gray-500 text-center">Your wishlist is empty</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full">
                <thead className="bg-gray-200 text-sm">
                  <tr>
                    <th className="p-4 text-left w-[40%]">Product</th>
                    <th className="p-4 text-left">Price</th>
                    <th className="p-4 text-left">Quantity</th>
                    <th className="p-4 text-left w-[30%]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {wishlist.map((item) => {
                    const { product, userInfo, location, deviceInfo } = item;

                    return (
                      <tr
                        key={product.id}
                        className=" hover:bg-gray-50 transition text-sm"
                      >
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
                          <span className="font-medium min-w-[200px]">
                            {product.title}
                          </span>
                        </td>

                        {/* PRICE */}
                        <td className="p-3 font-medium">
                          ${product?.sale_price?.toFixed(2)}
                        </td>

                        {/* QUANTITY */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              disabled={product.quantity === 1}
                              onClick={() =>
                                updateWishlistQuantity(product.id, "dec")
                              }
                              className="w-8 h-8  hover:bg-gray-100 hover:rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>

                            <span className="min-w-[20px] text-center">
                              {product.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateWishlistQuantity(product.id, "inc")
                              }
                              className="w-8 h-8 hover:bg-gray-100 hover:rounded-full"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="p-3">
                          <div className="flex items-center gap-16">
                            {/* ADD TO CART */}
                            <button
                              onClick={() => {
                                addToCart(
                                  product,
                                  userInfo,
                                  location,
                                  deviceInfo
                                );

                                // Optional UX: remove after adding
                                removeFromWishlist(
                                  product,
                                  userInfo,
                                  location,
                                  deviceInfo
                                );
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                            >
                              Add To Cart
                            </button>

                            {/* REMOVE */}
                            <button
                              onClick={() =>
                                removeFromWishlist(
                                  product,
                                  userInfo,
                                  location,
                                  deviceInfo
                                )
                              }
                              className="text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                            >
                              <X size={20} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className=" mt-4">
              <button
                onClick={() => router.push("/cart")}
                className="border border-gray-500 text-gray-500 py-2 px-3 rounded-md hover:bg-blue-600 hover:text-white transition"
              >
                Go To Cart
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}