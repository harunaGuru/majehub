export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar?: any; // adjust to your images type
  createdAt: Date;
  updatedAt: Date;
  role: 'user';
};

export type Seller = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone_number: string;
  country: string;
  shop?: any; // adjust to your shops type
  stripeId?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  role: 'seller';
};
