import ShopDetailsPage from '@/app/shared/components/ShopDetailsPage'
import React from 'react'
import { axiosInstance } from '@/utils/axiosInstance';
import { Metadata } from 'next';
import { cookies } from 'next/headers';



interface ShopPageProps {
  params: Promise<{ id: string }>;
}

const fetchShop = async (id: string, cookieHeader: string) => {
  try {
    const response = await axiosInstance.get(`/seller/api/get-shop-by-id/${id}`, {
      headers: { cookie: cookieHeader },
    })
    return response.data;
  } catch (error) {
    return null;
  }
}
export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  const shop = await fetchShop(id, cookieHeader);

  if (!shop) {
    return {
      title: 'Shop Not Found',
      description: 'This shop does not exist',
    };
  }

  return {
    title: shop?.name,
    description: shop.bio || "Explore shop products and offers",
    openGraph: {
      title: shop.name,
      description: shop.bio || "Explore shop products and offers",
      type: "website",
      images: [shop.coverBanner || shop.avatar],
    },
    twitter: {
      card: "summary_large_image",
      title: shop.name,
      description: shop.bio || "Explore shop products and offers",
      images: [shop.coverBanner || shop.avatar],
    },
  };


}

const ShopPage = async ({ params }: ShopPageProps) => {
  const { id } = await params;
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  const res = await fetchShop(id, cookieHeader);

  return (
    <ShopDetailsPage
      shop={res.shop}
      followersCount={res.shop?.followersCount}
    />
  )
}

export default ShopPage