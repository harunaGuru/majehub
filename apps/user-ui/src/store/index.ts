import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendKafkaEvent } from '@/actions/track-user';

interface Product {
  id: string;
  title: string;
  price?: number;
  sale_price?: number;
  quantity: number;
  image: string;
  discount_code?: string[];
  shopId: string;
  selectedOption?: {
    colors: string[];
    sizes: string[];
  };
}
export interface DeviceInfo {
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  deviceType?: string;
  deviceVendor?: string;
  deviceModel?: string;
  cpuArchitecture?: string;
}
export interface GeoData {
  country?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  isp?: string;
  query?: string; // IP
}
export interface UserInfo {
  name?: string;
  id: string;
}

export interface CartWishlistItem {
  product: Product;
  userInfo: UserInfo;
  location: GeoData;
  deviceInfo: DeviceInfo;
  addedAt: string;
}

interface Store {
  cart: CartWishlistItem[];
  wishlist: CartWishlistItem[];
  addToCart: (
    product: Product,
    user: UserInfo,
    location: GeoData,
    deviceInfo: DeviceInfo
  ) => void;

  removeFromCart: (
    product: Product,
    user: UserInfo,
    location: GeoData,
    deviceInfo: DeviceInfo
  ) => void;

  addToWishlist: (
    product: Product,
    user: UserInfo,
    location: GeoData,
    deviceInfo: DeviceInfo
  ) => void;
  updateCartQuantity: (productId: string, type: 'inc' | 'dec') => void;
  removeFromWishlist: (
    product: Product,
    user: UserInfo,
    location: GeoData,
    deviceInfo: DeviceInfo
  ) => void;
  updateWishlistQuantity: (productId: string, type: 'inc' | 'dec') => void;
  clearWishlist: () => void;
  clearCart: () => void;
}

export function buildEvent(
  type: string,
  product: any,
  user: any,
  location: any,
  deviceInfo: any
) {
  return {
    type,
    productId: product.id,
    shopId: product.shopId,
    userId: user?.id ?? 'anonymous',
    country: location?.country || 'Unknown',
    city: location?.city || 'Unknown',
    device: deviceInfo || 'Unknown device',
    timestamp: new Date().toISOString(),
  };
}
export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      addToCart: (product, user, location, deviceInfo) => {
        const event = buildEvent(
          'add_to_cart',
          product,
          user,
          location,
          deviceInfo
        );
        sendKafkaEvent(event);

        set((state) => {
          const existingIndex = state.cart.findIndex((item) => {
            const sameProduct = item.product.id === product.id;

            // const sameOptions =
            //   JSON.stringify(item.product.selectedOption) ===
            //   JSON.stringify(product.selectedOption);

            return sameProduct;
            // && sameOptions;
          });

          if (existingIndex !== -1) {
            const updatedCart = [...state.cart];

            updatedCart[existingIndex] = {
              ...updatedCart[existingIndex],
              product: {
                ...updatedCart[existingIndex].product,
                quantity:
                  updatedCart[existingIndex].product.quantity +
                  product.quantity,
              },
            };

            return { cart: updatedCart };
          }

          const newItem = {
            product,
            userInfo: user,
            location,
            deviceInfo,
            addedAt: new Date().toISOString(),
          };

          return { cart: [...state.cart, newItem] };
        });
      },
      updateCartQuantity: (productId: string, type: 'inc' | 'dec') =>
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.product.id === productId) {
              const newQty =
                type === 'inc'
                  ? item.product.quantity + 1
                  : Math.max(1, item.product.quantity - 1);

              return {
                ...item,
                product: {
                  ...item.product,
                  quantity: newQty,
                },
              };
            }
            return item;
          }),
        })),

      removeFromCart: (product, user, location, deviceInfo) => {
        const event = buildEvent(
          'remove_from_cart',
          product,
          user,
          location,
          deviceInfo
        );
        sendKafkaEvent(event);

        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== product.id),
        }));
      },

      clearCart: () => set({ cart: [] }),

      addToWishlist: (product, user, location, deviceInfo) => {
        const event = buildEvent(
          'add_to_wishlist',
          product,
          user,
          location,
          deviceInfo
        );
        sendKafkaEvent(event);
        const newItem: CartWishlistItem = {
          product,
          userInfo: user,
          location,
          deviceInfo,
          addedAt: new Date().toISOString(),
        };

        set((state) => ({
          wishlist: [...state.wishlist, newItem],
        }));
      },

      removeFromWishlist: (product, user, location, deviceInfo) => {
        const event = buildEvent(
          'remove_from_wishlist',
          product,
          user,
          location,
          deviceInfo
        );
        sendKafkaEvent(event);

        set((state) => ({
          wishlist: state.wishlist.filter(
            (item) => item.product.id !== product.id
          ),
        }));
      },
      updateWishlistQuantity: (productId: string, type: 'inc' | 'dec') =>
        set((state) => ({
          wishlist: state.wishlist.map((item) => {
            if (item.product.id === productId) {
              const newQty =
                type === 'inc'
                  ? item.product.quantity + 1
                  : Math.max(1, item.product.quantity - 1);

              return {
                ...item,
                product: {
                  ...item.product,
                  quantity: newQty,
                },
              };
            }
            return item;
          }),
        })),

      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: 'cart-wishlist-storage',
    }
  )
);
