import React from 'react';
import { axiosInstance } from '@/utils/axiosInstance';
import  ProductDetailsPage  from '@/app/shared/components/ProductDetails';
import { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}


const fetchProduct = async(slug:string):Promise<ProductCardProps | null>=>{
  try {
    const response = await axiosInstance.get(`/product/api/get-product/${slug}`)
    return response.data.product;
  }catch(error){
    console.error('Failed to fetch product', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const {slug} = await params
  const product = await fetchProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'This product does not exist',
    };
  }

  const imageUrl =
    product.images?.[0]?.fileUrl ||
    "https://ik.imagekit.io/3k74bqena/products/ryan-plomp-jvoZ-Aux9aw-unsplash__1__hQGw2_LW9.avif?updatedAt=1772530464579";

  return {
    title: product.title,
    description: product.short_Description,
    openGraph: {
      title: product.title,
      description: product.short_Description,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.short_Description,
      images: [imageUrl],
    },
  };
}

const ProductPage = async ({params}:ProductPageProps) => {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  // const {
  //   data: product,
  //   isLoading,
  // } = useQuery({
  //   queryKey: ['product', slug],
  //   queryFn: () => fetchProduct(slug),
  //   enabled: !!slug,
  // });
  // console.log("product", product);

  return(
    <ProductDetailsPage product={product} />
  );
};
export default ProductPage;

