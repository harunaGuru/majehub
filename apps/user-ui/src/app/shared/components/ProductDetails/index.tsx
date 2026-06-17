"use client"
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  BriefcaseBusiness,
  Check,
  CircleQuestionMark,
  Handbag,
  Heart,
  Loader2,
  MapPin,
  MessageSquarePlus,
} from 'lucide-react';
import ProductRating from '@/app/shared/components/Rating/DetailRating';
import QuantitySelector from '@/app/shared/components/QunatitySelector';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Spinner } from '@/app/shared/components/Spinner';
import { useUserDevice } from '@/hooks/useDeviceTracking';
import { useGeoLocation } from '@/hooks/useLocationTracking';
import { buildEvent, CartWishlistItem, Product, useStore } from '@/store';
import { sendKafkaEvent } from '@/actions/track-user';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/utils/axiosInstance';
import toast from 'react-hot-toast';
import { isProtected } from '@/utils/isProtected';
import { useUser } from '@/hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';
const ProductDetailedAndReviewTab = dynamic(
  () => import('@/app/shared/components/ProductDetailedAndReviewTab'),
  { ssr: false }
);

const ProductImageMagnifier = dynamic(
  () => import('@/app/shared/components/ProductImageMagnifier'),
  {
    ssr: false,
  }
);

const ProductDetailsPage = ({ product }: { product: any }) => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const image = product?.images?.[0];
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient();

  const { user, isLoading: userLoading } = useUser()
  const userInfo = {
    name: user?.name,
    id: user?.id,
  };


  const handleChat = async () => {
    try {
      setLoading(true)

      const { data } = await axiosInstance.post(
        '/chatting/api/create-conversation-id',
        {
          sellerId: product.shop.sellerId
        },
        isProtected()
      )
      await queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });
      const conversationId = data.conversationId
      router.push(`/inbox?conversationId=${conversationId}`)
    } catch (error) {
      if (!user) {
        toast.error('Please login to start chat')
        return
      }
      toast.error('Failed to start chat')
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (product) setIsLoading(false);
  }, [product]);

  useEffect(() => {
    if (image?.fileUrl) {
      setSelectedImage(image.fileUrl);
    }
  }, [image]);

  const {
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceType,
    cpuArch,
  } = useUserDevice();

  const { geoData } = useGeoLocation();
  const {
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
  } = useStore();

  const isInCart = useMemo(
    () =>
      !!product &&
      cart.some((item: CartWishlistItem) => item.product.id === product?.id),
    [cart, product]
  );
  const isInWishlist = useMemo(
    () =>
      !!product &&
      wishlist.some(
        (item: CartWishlistItem) => item.product.id === product?.id
      ),
    [wishlist, product]
  );
  const productPayload: Product = {
    id: product?.id as string,
    title: product?.title as string,
    price: product?.sale_price,
    sale_price: product?.price,
    quantity: quantity,
    discount_code: product?.discount_code || [],
    image:
      product?.images[0]?.fileUrl ||
      'https://ik.imagekit.io/3k74bqena/products/ryan-plomp-jvoZ-Aux9aw-unsplash__1__hQGw2_LW9.avif?updatedAt=1772530464579',
    shopId: product?.shop?.id,
    selectedOption: {
      colors: selectedColors || [],
      sizes: selectedSizes || [],
    },
  };
  useEffect(() => {
    if (!userLoading) {
      if (!geoData || !browserName || !user?.id) return;
      const event = buildEvent('product_view', product, user, geoData!, {
        browserName,
        browserVersion,
        osName,
        osVersion,
        deviceType,
        cpuArchitecture: cpuArch,
      });
      sendKafkaEvent(event)
    }
  }, [userLoading, geoData, browserName]);

  const handleAddToWishList = () => {
    if (isInWishlist) {
      removeFromWishlist(productPayload, userInfo, geoData!, {
        browserName,
        browserVersion,
        osName,
        osVersion,
        deviceType,
        cpuArchitecture: cpuArch,
      });
    } else {
      addToWishlist(productPayload, userInfo, geoData!, {
        browserName,
        browserVersion,
        osName,
        osVersion,
        deviceType,
        cpuArchitecture: cpuArch,
      });
    }
  };

  const handleAddToCart = () => {
    if (isInCart) {
      removeFromCart(productPayload, userInfo, geoData!, {
        browserName,
        browserVersion,
        osName,
        osVersion,
        deviceType,
        cpuArchitecture: cpuArch,
      });
    } else {
      addToCart(productPayload, userInfo, geoData!, {
        browserName,
        browserVersion,
        osName,
        osVersion,
        deviceType,
        cpuArchitecture: cpuArch,
      });
    }
  };

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
  };
  const handleSizeToggle = (size: string) => {
    setSelectedSizes(
      (prev) =>
        prev.includes(size)
          ? prev.filter((s) => s !== size) // unselect
          : [...prev, size] // select
    );
  };

  const handleToggleColor = (color: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(color)) {
        return prev.filter((c) => c !== color);
      } else {
        return [...prev, color];
      }
    });
  };

  function calculateDiscountPercentage(
    regularPrice: number,
    salePrice: number
  ): number {
    if (regularPrice <= 0) return 0;

    const discount = ((regularPrice - salePrice) / regularPrice) * 100;

    return Math.round(discount); // rounded to whole number
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-300 p-8">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full bg-gray-300 p-8 ">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-3 rounded-md  ">
        <div className="grid lg:grid-cols-[450px_1fr_300px] gap-8 px-4 pb-4 bg-gradient-to-r from-white via-gray-100 to-gray-150 shadow-lg">
          {/*Image Gallery*/}
          <div className="pt-6  space-y-3">
            {/* <div className="relative w-full aspect-square rounded-sm overflow-hidden">
              <Image
                src={
                  selectedImage ||
                  'https://ik.imagekit.io/3k74bqena/products/ryan-plomp-jvoZ-Aux9aw-unsplash__1__hQGw2_LW9.avif?updatedAt=1772530464579'
                }
                alt="Selected product image"
                fill
                className="object-cover"
                loading="eager"
                fetchPriority="high"
                priority
              />
            </div> */}
            <div className="w-full aspect-square rounded-sm bg-white">
              <ProductImageMagnifier
                image={
                  selectedImage ||
                  'https://ik.imagekit.io/3k74bqena/products/ryan-plomp-jvoZ-Aux9aw-unsplash__1__hQGw2_LW9.avif?updatedAt=1772530464579'
                }
              />
            </div>
            {/*Thumbnails*/}
            {product?.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product?.images?.map((img: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img?.fileUrl)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${selectedImage === img?.fileUrl
                      ? 'border-gray-200'
                      : 'border-none'
                      }`}
                  >
                    <Image
                      src={img?.fileUrl}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/*Product Details*/}
          <div className="pt-5 px-10 lg:px-0 ">
            <h2 className="font-bold whitespace-nowrap opacity-80 mt-0">
              {product?.title || 'Product'}
            </h2>
            <div className="flex flex-col gap-2 border-b border-gray-200 mt-3  ">
              <div className="flex items-center justify-between">
                <ProductRating value={product?.ratings || 4.5} />
                <button
                  onClick={handleAddToWishList}
                  className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition ${isInWishlist
                    ? 'bg-red-500 text-white'
                    : 'bg-white hover:bg-gray-100'
                    }`}
                >
                  <Heart size={18} fill={isInWishlist ? 'white' : 'none'} />
                </button>
              </div>
              <div className="text-gray-500 text-sm font-semibold mb-2">
                <span>Brand:</span>{' '}
                <span className="text-blue-600">
                  {product?.brand || 'No brand'}
                </span>
              </div>
            </div>
            <div className="flex flex-col border-b border-gray-200 mt-3">
              <h3 className="text-base font-extrabold text-[#C15B27]">
                ${product?.sale_price}
              </h3>
              <div className="space-x-2 mb-2">
                <span className="text-gray-500 line-through font-semibold ">
                  ${product?.regular_price}
                </span>
                <span className="text-gray-500 font-semibold">
                  {calculateDiscountPercentage(
                    product?.regular_price,
                    product?.sale_price
                  )}
                  %
                </span>
              </div>
            </div>
            <div className="flex flex-col mt-3">
              <span className="font-bold text-sm">Color:</span>
              <div className="flex items-center gap-2 mt-1">
                {product?.colors?.map((color: string) => {
                  const isActive = selectedColors.includes(color);

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleToggleColor(color)}
                      className={`
                            w-6 h-6 rounded-full transition-all duration-200
                            border border-gray-700/50
                            ${isActive
                          ? 'border-gray-900  scale-110'
                          : 'border-transparent'
                        }
                          `}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  );
                })}
              </div>
            </div>
            {/*Sizes selector*/}
            {product?.sizes?.length > 0 && (
              <div className="mt-3">
                <span className="font-bold text-sm mb-3">Sizes:</span>

                <div className="flex gap-3 flex-wrap">
                  {product?.sizes?.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`px-2 py-1 rounded-md border transition ${selectedSizes.includes(size)
                        ? 'bg-black text-white border-black'
                        : 'bg-white border-gray-300 hover:border-black'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="my-5">
              <QuantitySelector
                stock={product?.stock || 100}
                defaultValue={quantity}
                onChange={handleQuantityChange}
              />
            </div>
            <button
              onClick={handleAddToCart}
              className={`
                px-3 sm:text-sm font-semibold rounded-lg py-2 
                flex items-center justify-center gap-2 
                transition-all duration-300
                ${isInCart
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-[#EF4444] hover:bg-[#f15656] text-white'
                }
              `}
            >
              {isInCart ? (
                <>
                  <Check size={18} />
                  In Cart
                </>
              ) : (
                <>
                  <Handbag size={18} />
                  Add to Cart
                </>
              )}
            </button>
          </div>
          {/*Product address*/}
          <div className="flex flex-col gap-6 text-gray-800 text-sm p-2 px-10 lg:px-0 border-none ">
            <div className="">
              <h4>Delivery Option</h4>
              <span className="flex items-center gap-1 text-[15px] font-semibold">
                <MapPin size={16} />
                {geoData
                  ? `${geoData?.city}, ${geoData.country}`
                  : 'Abuja, Nigeria'}
              </span>
            </div>
            <div>
              <h4 className="mb-1">Return & Warranty</h4>
              <span className="flex items-center gap-1 text-[15px] mb-2">
                <CircleQuestionMark size={16} />7 Days Return
              </span>
              <span className="flex items-center gap-1 text-[15px]">
                <BriefcaseBusiness size={16} />
                Warranty not available
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col justify-center">
                <span>sold by</span>
                <h4 className="font-semibold text-blue-600">{product?.shop?.name}</h4>
              </div>
              <button
                onClick={handleChat}
                disabled={loading}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <MessageSquarePlus size={19} />
                )}
                <span>{loading ? 'Opening...' : 'Chat Now'}</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1 ">
              <div className="flex flex-col justify-start">
                <span className="text-wrap">Positive Seller Ratings</span>
                <span className="font-bold">88%</span>
              </div>
              <div className="flex flex-col justify-start">
                <span className="text-wrap">Ship on Time</span>
                <span className="font-bold">100%</span>
              </div>
              <div className="flex flex-col justify-start">
                <span className="text-wrap">Chat Response Rate</span>
                <span className="font-bold">100%</span>
              </div>
            </div>
            <Link
              className="w-full flex items-center justify-center text-sm text-blue-600 font-bold"
              href="/shops"
            >
              Go TO STORE
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full max-w-7xl mx-auto rounded-md  bg-gray-100 px-6 mt-4">
        <div className="bg-gray-100 rounded-xl p-4">
          <ProductDetailedAndReviewTab
            descriptionHTML={
              product?.detailed_description || (
                <p>No Detailed Description for the Product </p>
              )
            }
            reviews={<p>No Reviews Yet</p>}
          />
        </div>
      </div>
    </div>
  );
}
export default ProductDetailsPage