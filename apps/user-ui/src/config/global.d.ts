type NavItem = {
  name: string;
  path: string;
};

type SubCategoryMap = {
  [key: string]: string[];
};

interface ProductCardProps {
  id: string;
  title: string;
  images: {
    id: string;
    fileUrl: string;
  }[];
  short_Description: string;
  sale_price: number;
  regular_price: number;
  event: boolean;
  starting_date?: string | null;
  ending_date?: string | null;
  discount_code?: string[];
  stock: number;
  totalSales: number;
  slug: string;
  shop: {
    id: string;
  };
}
