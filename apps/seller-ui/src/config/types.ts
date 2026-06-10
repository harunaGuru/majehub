export interface ProductImage {
  fileId: string;
  fileUrl: string;
}

export interface Shop {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  title: string;
  sale_price: number;
  slug: string;
  stock: number;
  category: string;
  ratings: number;
  isDeleted?: boolean;
  images: ProductImage[];
  shop: Shop;
  createdAt: string;
}

export interface GetProductsResponse {
  success: boolean;
  products: Product[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
  };
}
export interface ProductAnalytics {
  views: number;
  cartAdds: number;
  wishlistAdds: number;
  purchases: number;
  revenue: number;
  lastViewAt: string;
}
