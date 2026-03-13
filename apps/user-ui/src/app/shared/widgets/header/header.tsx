'use client';
import React from 'react';
import { Heart, Search } from 'lucide-react';
import Link from 'next/link';
import HeaderBottom from './headerBottom';
import ProfileIcon from '@/assets/svgs/profile-icon';
import ShoppingCart from '@/assets/svgs/shopping-cart';
import { useUser } from '@/hooks/useUser';
import { useStore } from '@/store';

const Header = () => {
  const {user, isLoading} = useUser();
  const {cart, wishlist} = useStore()
  const cartlength = cart?.length
  const wishlistLength = wishlist?.length
  // console.log("Header section", user);

  return (
    <div className="flex flex-col w-full">
      <div className="w-[80%] mx-auto bg-white py-5">
        <div className="flex items-center justify-between w-full">
          <div>logo</div>
          <div className="flex w-[50%] items-center">
            <input
              type="text"
              placeholder="search for products.."
              className="w-full h-12 p-2 text-gray-400 focus:outline-none border-2 border-blue-700 rounded-l-sm rounded-r-md"
            />
            <div className="p-2 h-12 bg-blue-700 flex items-center justify-center ml-[-4px] cursor-pointer rounded-r-sm">
              <Search color="#Fff" />
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {/* <User /> */}
            <div className="flex items-center">
              {!isLoading && user ? (
                <>
                  <Link
                    href="/profile"
                    className=" border bg-white border-gray-200 rounded-full cursor-pointer"
                  >
                    <ProfileIcon width={40} height={40} color="#282828" />
                  </Link>
                  <Link
                    href="/profile"
                    className="flex flex-col justify-center ml-2"
                  >
                    <span className="text-xs font-medium">Hello</span>
                    <span className="text-xs font-medium">
                      {user.name.split(' ')[0]}{' '}
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className=" border bg-white border-gray-200 rounded-full cursor-pointer"
                  >
                    <ProfileIcon width={40} height={40} color="#282828" />
                  </Link>
                  <Link
                    href="/login"
                    className="flex flex-col justify-center ml-2"
                  >
                    <span className="text-xs font-medium">Hello,</span>
                    <span className="text-xs font-medium">Sign in </span>
                  </Link>
                </>
              )}
            </div>
            <Link
              href="/whishlist"
              className="flex items-center gap-2 relative cursor-pointer"
            >
              <Heart />
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {wishlistLength || 0}
              </span>
            </Link>
            <Link
              href="/cart"
              className="flex text-white items-center gap-2 relative cursor-pointer"
            >
              {/* <Handbag /> */}
              <ShoppingCart
                stroke="#030708"
                strokeWidth="1.2px"
                width={24}
                height={24}
                fill="#fff"
              />

              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {cartlength || 0}
              </span>
            </Link>
          </div>
        </div>
      </div>
      <HeaderBottom />
    </div>
  );
};

export default Header;
