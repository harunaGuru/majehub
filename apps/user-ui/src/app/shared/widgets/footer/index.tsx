"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Send,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="pt-10 pb-5 bg-gray-200 text-gray-600 text-sm">
      <div className="w-[90%] lg:w-[80%] mx-auto">

        {/* CARD CONTAINER */}
        <div className="bg-white shadow-sm rounded-2xl px-6 md:px-10 py-12">

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* COLUMN 1 */}
            <div className="transition-all duration-300 hover:-translate-y-1">
              <h2 className="text-sm font-semibold text-gray-600 mb-4">
                Perfect ecommerce platform to start your business from scratch
              </h2>

              {/* SOCIALS */}
              <div className="flex gap-4 mt-4">
                {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                  <Link
                    key={i}
                    href="#"
                    className="p-3 rounded-full bg-gray-100 hover:bg-blue-500 hover:text-white transition-all duration-300"
                  >
                    <Icon size={16} />
                  </Link>
                ))}
              </div>

              {/* NEWSLETTER */}
              <div className="mt-6">
                <p className="text-sm mb-2">Subscribe to our newsletter</p>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
                  />
                  <button className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 2 */}
            <div className="transition-all duration-300 hover:-translate-y-1 text-sm">
              <h3 className="font-bold text-gray-600 text-sm mb-4">
                MY Account
              </h3>
              <ul className="space-y-2">
                {[
                  "Track Orders",
                  "Shopping",
                  "Wishlist",
                  "My Account",
                  "Order History",
                  "Returns",
                ].map((item) => (
                  <li key={item}>
                    <Link href="#" className="relative inline-block group">
                      {item}
                      <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3 */}
            <div className="transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold text-gray-600 mb-4">
                MY Information
              </h3>
              <ul className="space-y-2">
                {[
                  "Our Story",
                  "Careers",
                  "Privacy Policy",
                  "Terms & Conditions",
                  "Latest News",
                  "Contact Us",
                ].map((item) => (
                  <li key={item}>
                    <Link href="#" className="relative inline-block group">
                      {item}
                      <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 4 */}
            <div className="transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold text-gray-600 mb-4 ">
                Talk To Us
              </h3>
              <ul className="space-y-3">
                <li>Got Questions? Call us</li>
                <li className="font-medium text-gray-900 text-lg">
                  +243 818 901 0967
                </li>

                <li className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>haruna.dauda123@gmail.com</span>
                </li>

                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-1" />
                  <span>293 Dutse Alh. FCT Abuja</span>
                </li>
              </ul>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">

            <p>© 2026 All Rights Reserved | Haroon Limited</p>

            {/* PAYMENT */}
            <div className="flex gap-3">
              <div className="px-4 py-2 rounded-lg bg-gray-100 text-xs font-semibold">
                VISA
              </div>
              <div className="px-4 py-2 rounded-lg bg-gray-100 text-xs font-semibold">
                MASTERCARD
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}