'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Heart, Search } from 'lucide-react';
import Link from 'next/link';
import HeaderBottom from './headerBottom';
import ProfileIcon from '@/assets/svgs/profile-icon';
import ShoppingCart from '@/assets/svgs/shopping-cart';
import { useUser } from '@/hooks/useUser';
import { useStore } from '@/store';
import { axiosInstance } from '@/utils/axiosInstance';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';

const searchProducts = async (query: string) => {
  const { data } = await axiosInstance.get(
    `/product/api/search-products?q=${query}`
  );
  return data.products;
};

const getSiteConfig = async () => {
  const { data } = await axiosInstance.get("/admin/api/site-config");
  return data.data;
};
const RECENT_KEY = "recent_searches";
const Header = () => {
  const { user, isLoading } = useUser();
  const { cart, wishlist } = useStore()
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search);

  const { data: products, isFetching } = useQuery({
    queryKey: ["search-products", debouncedSearch],
    queryFn: () => searchProducts(debouncedSearch),
    enabled: !!debouncedSearch,
  });
  const { data: siteConfig } = useQuery({
    queryKey: ["site-config"],
    queryFn: getSiteConfig,
    staleTime: 1000 * 60 * 10,
  });
  const userCart = cart.filter((item) => item.userInfo.id === user?.id)
  const userWishlist = wishlist.filter((item) => item.userInfo.id === user?.id)
  const cartlength = userCart?.length || 0
  const wishlistLength = userWishlist?.length || 0

  // recent searches
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_KEY);
    if (stored) setRecent(JSON.parse(stored));
  }, []);

  // Save recent search
  const saveRecent = (value: string) => {
    if (!value.trim()) return;

    let updated = [value, ...recent.filter((r) => r !== value)];
    updated = updated.slice(0, 5);

    setRecent(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };
  //Remove recent search
  const removeRecent = (value: string) => {
    const updated = recent.filter((item) => item !== value);
    setRecent(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current) return;

      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = products.length ? products : recent;

    if (!list.length) return;

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => (prev + 1) % list.length);
    }

    if (e.key === "ArrowUp") {
      setActiveIndex((prev) =>
        prev <= 0 ? list.length - 1 : prev - 1
      );
    }

    if (e.key === "Enter") {
      const item = list[activeIndex];
      if (!item) return;

      const value = typeof item === "string" ? item : item.title;
      const slug = typeof item === "string" ? null : item.slug;

      saveRecent(value);
      setIsOpen(false);

      if (slug) {
        window.location.href = `/product/${slug}`;
      } else {
        setSearch(value);
      }
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  console.log("user", user)

  return (
    <div className="flex flex-col w-full">
      <div className="w-full md:w-[80%] mx-auto bg-white px-3 md:px-0">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center">
            <div className="relative w-[92px] h-14">
              <Image
                src={siteConfig?.avatar || "/homelog.png"}
                alt="logo"
                fill
                className="object-cover"
                sizes='(max-width: 768px) 92px, (max-width: 1200px) 70vw, 50vw'
                priority
              />
            </div>
          </Link>
          <div ref={containerRef} className="flex w-[50%] items-center relative">
            <input
              value={search}
              onFocus={() => {
                if (recent.length > 0) {
                  setIsOpen(true);
                }
              }}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
                setActiveIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              type="text"
              placeholder="search for products.."
              className="w-full h-12 p-2 text-gray-900 focus:outline-none border-2 border-blue-700 rounded-l-sm rounded-r-md"
            />
            <div className="p-2 h-12 bg-blue-700 flex items-center justify-center ml-[-4px] cursor-pointer rounded-r-sm">
              <Search color="#Fff" />
            </div>
            {/* 🔽 DROPDOWN */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-14 left-0 w-full bg-white shadow-xl rounded-md z-50 max-h-[320px] overflow-y-auto border"
                >
                  {/* 🔹 Loading */}
                  {isFetching && (
                    <div className="p-3 text-sm text-gray-400">
                      Searching...
                    </div>
                  )}

                  {/* Products */}
                  {!isFetching && products?.length > 0 && (
                    <>
                      {products.map((product: any, index: number) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          onClick={() => {
                            saveRecent(product.title);
                            setSearch("");
                            setIsOpen(false);
                            setActiveIndex(-1);
                          }}
                          className={`block p-3 text-sm cursor-pointer ${index === activeIndex
                            ? "bg-gray-100"
                            : "hover:bg-gray-100"
                            }`}
                        >
                          {product.title}
                        </Link>
                      ))}
                    </>
                  )}

                  {/* Recent Searches */}
                  {!debouncedSearch && recent.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-xs text-gray-400">
                        Recent searches
                      </div>
                      {recent.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSearch(item);
                            setIsOpen(false);
                            setActiveIndex(-1);
                          }}
                          className={`flex items-center justify-between p-3 text-sm cursor-pointer ${index === activeIndex
                            ? "bg-gray-100"
                            : "hover:bg-gray-100"
                            }`}
                        >
                          <span className="truncate">{item}</span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecent(item);
                            }}
                            className="ml-2 text-gray-400 hover:text-red-500 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Empty */}
                  {!isFetching &&
                    debouncedSearch &&
                    products?.length === 0 && (
                      <div className="p-3 text-sm text-gray-400">
                        No products found
                      </div>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
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
                    {user?.avatar ?
                      <Image width={40} height={40} src={user.avatar.fileUrl} alt="avater" className="object-cover p-0.5 rounded-full" /> :
                      <ProfileIcon width={40} height={40} color="#282828" />}
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
              href="/wishlist"
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
