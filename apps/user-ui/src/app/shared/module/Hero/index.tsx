"use client"
import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/utils/axiosInstance';

const getSiteConfig = async () => {
  const { data } = await axiosInstance.get("/admin/api/site-config");
  return data.data;
};

const Hero = () => {
  const { data: siteConfig } = useQuery({
    queryKey: ["site-config"],
    queryFn: getSiteConfig,
    staleTime: 1000 * 60 * 10,
  });
  return (
    <section className="w-full min-h-[70dvh] lg:h-[calc(100vh-115px)]  overflow-y-hidden  bg-[#0A3443] text-white flex items-center">
      <div className="max-w-7xl mx-auto w-full px-6 py-8 lg:py-12">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          {/* LEFT CONTENT */}
          <div className="text-center lg:text-left max-w-xl">
            <p className="text-sm uppercase tracking-wider text-gray-300">
              Starting from $40
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight mt-4">
              The Best Watch <br className="hidden sm:block" />
              Collection 2025
            </h1>

            <p className="text-base font-oregano sm:text-lg my-6 text-gray-200">
              Exclusive offer{' '}
              <span className="text-yellow-400 font-semibold">10%</span> off
              this week
            </p>

            <Link
              href="/products"
              className="inline-flex items-center gap-3 bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition"
            >
              Shop Now
              <ArrowRightIcon size={18} />
            </Link>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative w-full max-w-[350px] sm:max-w-[450px] lg:max-w-[600px] aspect-square">
            <Image
              src={siteConfig?.banner || "/smart-watch.png"}
              alt="Smart Watch"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
};

export default Hero;
