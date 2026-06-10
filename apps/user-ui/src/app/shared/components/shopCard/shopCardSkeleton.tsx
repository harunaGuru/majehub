
export default function ShopCardSkeleton() {
  return (
    <div className="bg-white rounded-sm shadow-sm animate-pulse overflow-hidden w-full max-w-sm">
      {/* Cover Banner Skeleton */}
      <div className="relative h-32 w-full bg-gray-300" />

      {/* Avatar Skeleton */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-300" />
      </div>

      {/* Content Skeleton */}
      <div className="pt-12 pb-5 px-4 text-center space-y-2">
        <div className="h-5 w-3/4 mx-auto bg-gray-300 rounded" /> {/* Name */}
        <div className="h-3 w-1/2 mx-auto bg-gray-300 rounded" /> {/* Followers */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-3 w-20 bg-gray-300 rounded truncate" />
          <span>•</span>
          <div className="h-3 w-8 bg-gray-300 rounded" />
        </div>
        <div className="h-3 w-1/3 mx-auto bg-gray-300 rounded" /> {/* Category */}
        <div className="h-4 w-24 mx-auto bg-gray-300 rounded mt-2" /> {/* Visit Shop */}
      </div>
    </div>
  );
}
