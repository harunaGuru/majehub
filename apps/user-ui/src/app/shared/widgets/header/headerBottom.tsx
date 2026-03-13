"use client"
import ProfileIcon from '@/assets/svgs/profile-icon';
import { navLinks } from '@/config/constant';
import {
  ChevronDown,
  Heart,
  ShoppingCart,
  TextAlignStart,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import {defaultCategories, defaultSubCategories} from '@/config/constant';
import { useStore } from '@/store';

const HeaderBottom = () => {
  const {user, isLoading} = useUser()
  const router = useRouter();
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isFixed, setIsFixed] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const {cart, wishlist} = useStore()
  const cartlength = cart?.length;
  const wishlistLength = wishlist?.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDeptOpen(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handlescrollStick = () => {
      if (window.scrollY > 100) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener('scroll', handlescrollStick);
    return () => {
      window.removeEventListener('scroll', handlescrollStick);
    };
  }, []);

  const handleSubCategoryClick = (sub: string) => {
    router.push(`/products?subcategory=${encodeURIComponent(sub)}`);
    setIsDeptOpen(false);
    setActiveCategory(null);
  };

  return (
    <div
      className={`w-full bg-white border-t border-gray-200 ${
        isFixed ? 'fixed top-0 left-0 z-50 shadow-md' : 'static'
      }`}
    >
      <div className="w-[95%] lg:w-[80%] mx-auto bg-white">
        <div className="flex items-center justify-between w-full py-3">
          {/*  MOBILE  BUTTON */}
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>

          {/* LEFT SIDE */}
          <div className="hidden lg:flex items-center justify-between w-2/3">
            {/*  ALL DEPARTMENTS  */}
            <div className="relative ref={dropdownRef} ">
              <button
                onClick={() => setIsDeptOpen(!isDeptOpen)}
                className="w-[280px] bg-blue-500 p-3 flex justify-between items-center cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <TextAlignStart color="#fff" size={20} />
                  <span className="text-white text-sm">All Departments</span>
                </div>

                {/* 🔥 Chevron rotates */}
                <ChevronDown
                  color="#fff"
                  className={`transition-transform duration-300 ${
                    isDeptOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* 🔥 DROPDOWN */}
              <div
                className={`absolute top-full left-0 w-[280px] bg-white shadow-lg transition-all duration-300 overflow-hidden ${
                  isDeptOpen
                    ? 'max-h-[600px] opacity-100 z-50'
                    : 'max-h-0 opacity-0'
                }`}
              >
                {defaultCategories.map((cat) => (
                  <div key={cat} className="">
                    {/* CATEGORY */}
                    <button
                      onClick={() =>
                        setActiveCategory(activeCategory === cat ? null : cat)
                      }
                      className="w-full flex justify-between items-center px-4 py-3 text-sm hover:bg-blue-50"
                    >
                      {cat}

                      <ChevronRight
                        size={16}
                        className={`transition-transform duration-300 ${
                          activeCategory === cat ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {/* 🔥 SUBCATEGORIES WITH SMOOTH TRANSITION */}
                    <div
                      className={`transition-all duration-300 overflow-hidden ${
                        activeCategory === cat ? 'max-h-[300px]' : 'max-h-0'
                      }`}
                    >
                      {defaultSubCategories[cat]?.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleSubCategoryClick(sub)}
                          className="block w-full text-left px-8 py-2 text-sm hover:bg-blue-50"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🔥 NAV LINKS */}
            <nav className=" flex items-center gap-6">
              {navLinks.map((link: NavItem) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className="w-full font-poppins text-sm font-semibold whitespace-nowrap"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* RIGHT SIDE */}
          {isFixed && (
            <div className="hidden lg:flex gap-4 items-center">
              {/* unchanged user logic */}
              {!isLoading && user ? (
                <>
                  <Link
                    href="/profile"
                    className="border bg-white border-gray-200 rounded-full"
                  >
                    <ProfileIcon width={40} height={40} color="#282828" />
                  </Link>

                  <Link
                    href="/profile"
                    className="flex flex-col justify-center ml-2"
                  >
                    <span className="text-xs font-medium">Hello</span>
                    <span className="text-xs font-medium">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="border bg-white border-gray-200 rounded-full"
                  >
                    <ProfileIcon width={40} height={40} color="#282828" />
                  </Link>

                  <Link
                    href="/login"
                    className="flex flex-col justify-center ml-2"
                  >
                    <span className="text-xs font-medium">Hello,</span>
                    <span className="text-xs font-medium">Sign in</span>
                  </Link>
                </>
              )}

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
          )}
        </div>

        {/* 🔥 MOBILE DROPDOWN NAV */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-300 py-4 space-y-2">
            {navLinks.map((link: NavItem) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="block hover:bg-blue-50 py-2 px-4 text-sm font-poppins font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderBottom;
