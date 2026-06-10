"use client";

import React from "react";
import { Product } from "@/config/types";
import { X, Eye, ShoppingCart, Heart, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";

interface ProductAnalytics {
  views: number;
  cartAdds: number;
  wishlistAdds: number;
  purchases: number;
  revenue: number;
  lastViewAt: string;
}

interface Props {
  product: Product;
  onClose: () => void;
}

export const ProductAnalyticsModal = ({
  product,
  onClose,
}: Props) => {
  const analytics: ProductAnalytics = {
    views: 12450,
    cartAdds: 1830,
    wishlistAdds: 920,
    purchases: (product as any).totalSales || 287,
    revenue:
      ((product as any).totalSales || 287) * product.sale_price,
    lastViewAt: "2026-06-02T10:45:00",
  };

  const viewToCartRate =
    analytics.views > 0
      ? ((analytics.cartAdds / analytics.views) * 100).toFixed(1)
      : "0";

  const viewToWishlistRate =
    analytics.views > 0
      ? ((analytics.wishlistAdds / analytics.views) * 100).toFixed(1)
      : "0";

  const cartToPurchaseRate =
    analytics.cartAdds > 0
      ? ((analytics.purchases / analytics.cartAdds) * 100).toFixed(1)
      : "0";

  const overallConversionRate =
    analytics.views > 0
      ? ((analytics.purchases / analytics.views) * 100).toFixed(1)
      : "0";

  const performanceScore = Math.min(
    100,
    Math.round(
      analytics.views * 0.001 +
      analytics.cartAdds * 0.01 +
      analytics.wishlistAdds * 0.01 +
      analytics.purchases * 0.08
    )
  );

  const radialOptions = {
    chart: {
      type: "radialBar" as const,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "70%",
        },
        dataLabels: {
          name: {
            color: "#fff",
          },
          value: {
            color: "#fff",
            fontSize: "28px",
          },
        },
      },
    },
    labels: ["Score"],
  };

  const funnelData = [
    {
      label: "Views",
      value: analytics.views,
      width: "100%",
      color: "bg-blue-500",
    },
    {
      label: "Cart Adds",
      value: analytics.cartAdds,
      width: "70%",
      color: "bg-green-500",
    },
    {
      label: "Wishlist",
      value: analytics.wishlistAdds,
      width: "50%",
      color: "bg-pink-500",
    },
    {
      label: "Purchases",
      value: analytics.purchases,
      width: "30%",
      color: "bg-yellow-500",
    },
  ];

  const getHealthBadges = () => {
    const badges = [];

    if (analytics.views > 5000)
      badges.push("🔥 High Interest");

    if (analytics.purchases > 100)
      badges.push("⭐ Strong Sales");

    if (Number(overallConversionRate) > 2)
      badges.push("🚀 Good Conversion");

    if ((product as any).totalSales > 100)
      badges.push("🏆 Bestseller");

    return badges;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-7xl h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center z-20">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Product Analytics
            </h2>
            <p className="text-slate-400 mt-1">
              {product.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* KPI CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <AnalyticsCard
              icon={<Eye size={20} />}
              title="Views"
              value={analytics.views.toLocaleString()}
            />

            <AnalyticsCard
              icon={<ShoppingCart size={20} />}
              title="Cart Adds"
              value={analytics.cartAdds.toLocaleString()}
            />

            <AnalyticsCard
              icon={<Heart size={20} />}
              title="Wishlist Adds"
              value={analytics.wishlistAdds.toLocaleString()}
            />

            <AnalyticsCard
              icon={<DollarSign size={20} />}
              title="Purchases"
              value={analytics.purchases.toLocaleString()}
            />
          </div>

          {/* Revenue + Score */}

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white text-lg font-semibold">
                Revenue Generated
              </h3>

              <p className="text-4xl font-bold text-green-400 mt-4">
                ${analytics.revenue.toLocaleString()}
              </p>

              <div className="mt-6">
                <span className="text-slate-400">
                  Average Revenue Per Purchase
                </span>

                <p className="text-xl text-white mt-2">
                  $
                  {(
                    analytics.revenue /
                    analytics.purchases
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-white text-lg font-semibold mb-4">
                Performance Score
              </h3>

              <Chart
                options={radialOptions}
                series={[performanceScore]}
                type="radialBar"
                height={280}
              />
            </div>
          </div>

          {/* FUNNEL */}

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-white text-lg font-semibold mb-6">
              Conversion Funnel
            </h3>

            <div className="space-y-4">
              {funnelData.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`${item.color} h-14 rounded-md flex items-center justify-between px-4 text-white font-semibold`}
                    style={{ width: item.width }}
                  >
                    <span>{item.label}</span>
                    <span>
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* METRICS */}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white text-lg font-semibold mb-4">
                Conversion Metrics
              </h3>

              <div className="space-y-4 text-white">
                <Metric
                  label="View → Cart"
                  value={`${viewToCartRate}%`}
                />

                <Metric
                  label="View → Wishlist"
                  value={`${viewToWishlistRate}%`}
                />

                <Metric
                  label="Cart → Purchase"
                  value={`${cartToPurchaseRate}%`}
                />

                <Metric
                  label="Overall Conversion"
                  value={`${overallConversionRate}%`}
                />
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white text-lg font-semibold mb-4">
                Product Health
              </h3>

              <div className="flex flex-wrap gap-3">
                {getHealthBadges().map((badge) => (
                  <span
                    key={badge}
                    className="px-4 py-2 rounded-full bg-slate-700 text-white"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-2 text-slate-300">
                  <TrendingUp size={18} />
                  Last Viewed
                </div>

                <p className="text-white mt-2">
                  {new Date(
                    analytics.lastViewAt
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AnalyticsCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <motion.div
    whileHover={{ y: -3 }}
    className="bg-slate-800 border border-slate-700 rounded-xl p-5"
  >
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{title}</span>
      <div className="text-blue-400">{icon}</div>
    </div>

    <p className="text-white text-3xl font-bold mt-3">
      {value}
    </p>
  </motion.div>
);

const Metric = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex justify-between">
    <span className="text-slate-400">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);