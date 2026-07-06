'use client';
import Image from 'next/image';
import Link from 'next/link';
import Rating from '@/shared/components/Rating';

interface ProductCardProps {
  id: string;
  title: string;
  images: {
    id: string;
    url: string;
  }[];
  short_Description: string;
  sale_price: number;
  regular_price: number;
  event: boolean;
  starting_date?: string | null;
  ending_date?: string | null;
  stock: number;
  totalSales: number;
  slug: string;
}

const ProductCard = ({
  id,
  title,
  images,
  sale_price,
  regular_price,
  slug,
  stock,
  starting_date = null,
  event,
  totalSales,
}: ProductCardProps) => {
  const isEvent = event || starting_date !== null;
  const isLimited = stock < 10;
  return (
    <div className=" bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden ">
      {/* IMAGE SECTION */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        <Link href={`${process.env.NEXT_PUBLIC_USER_URL}/product/${slug}`} className="block w-full h-full">
          <Image
            src={
              images[0]?.url ||
              'https://ik.imagekit.io/3k74bqena/products/ryan-plomp-jvoZ-Aux9aw-unsplash__1__hQGw2_LW9.avif?updatedAt=1772530464579'
            }
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover"
          />
        </Link>
        {isLimited && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Limited
          </span>
        )}
        {isEvent && (
          <div className="absolute top-0 right-0">
            <div className="w-0 h-0 border-t-[60px] border-t-red-500 border-l-[60px] border-l-transparent"></div>
            <span className="absolute top-2 font-oregano right-1 text-[10px] font-bold text-white rotate-45">
              EVENT
            </span>
          </div>
        )}
      </div>

      {/* CONTENT SECTION */}
      <div className="p-4 space-y-2">
        {/* TITLE */}
        <Link
          href={`/product/${slug}`}
          className="text-sm font-medium text-blue-700 line-clamp-2 hover:text-blue-600 transition"
        >
          {title}
        </Link>

        {/* RATING */}
        <div>
          <Rating value={4} />
        </div>

        {/* PRICE + SOLD */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-blue-600">
              ${sale_price}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ${regular_price}
            </span>
          </div>

          <span className="text-xs font-semibold text-green-500">
            {totalSales} sold
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
