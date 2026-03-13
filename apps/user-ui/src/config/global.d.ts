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
  starting_date?: string | null;
  ending_date?: string | null;
  stock: number;
  totalSales: number;
  slug: string;
  shop: {
    id: string;
  };
}