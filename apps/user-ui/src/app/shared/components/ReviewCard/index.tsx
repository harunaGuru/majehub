import { Star } from "lucide-react";
import Image from "next/image";

export function ReviewsPanel({ reviews, rating }: { reviews: any[]; rating: number }) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Summary */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">

        {/* rating */}
        <div className="flex items-end gap-2">
          <div className="text-4xl font-bold text-gray-900">{rating}</div>
          <div className="text-sm text-gray-500 mb-1">/ 5</div>
        </div>

        <div className="text-sm text-gray-500 mt-1">
          Based on {reviews.length} reviews
        </div>

        {/* stars preview */}
        <div className="flex items-center gap-1 text-yellow-500 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} fill={i < Math.round(rating) ? "currentColor" : "none"} />
          ))}
        </div>

        {/* breakdown */}
        <div className="mt-5 space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter(r => r.rating === star).length;
            const pct = (count / reviews.length) * 100 || 0;

            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-gray-600">{star}</span>

                {/* bar */}
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-black to-gray-700 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-8 text-right text-gray-400 text-xs">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews list */}
      <div className="md:col-span-2 space-y-5">
        {reviews.map((r) => (
          <ReviewItem key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}

export function ReviewItem({ r }: { r: any }) {
  return (
    <div className="group relative bg-white rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      {/* subtle gradient hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-gray-50 via-transparent to-gray-50" />

      {/* avatar */}
      <div className="relative w-11 h-11 shrink-0">
        <Image
          src={r.avatar}
          alt={r.name}
          fill
          className="rounded-full object-cover ring-2 ring-gray-100"
        />
      </div>

      {/* content */}
      <div className="flex-1 relative">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-900">{r.name}</div>
          <div className="text-xs text-gray-400">{r.date}</div>
        </div>

        {/* stars */}
        <div className="flex items-center gap-1 text-yellow-500 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className="transition"
              fill={i < r.rating ? "currentColor" : "none"}
            />
          ))}
        </div>

        {/* comment */}
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          {r.comment}
        </p>
      </div>
    </div>
  );
}
