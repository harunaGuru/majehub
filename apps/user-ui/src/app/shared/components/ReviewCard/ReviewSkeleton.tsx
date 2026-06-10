export function ReviewItemSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl p-4 flex gap-4 border border-gray-100">
      {/* avatar */}
      <div className="w-11 h-11 rounded-full bg-gray-200" />

      {/* content */}
      <div className="flex-1">
        {/* name + date */}
        <div className="flex justify-between items-center">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-2 w-16 bg-gray-200 rounded" />
        </div>

        {/* stars */}
        <div className="flex gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-200 rounded" />
          ))}
        </div>

        {/* comment */}
        <div className="mt-3 space-y-2">
          <div className="h-2 bg-gray-200 rounded w-full" />
          <div className="h-2 bg-gray-200 rounded w-5/6" />
          <div className="h-2 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}
export function ReviewsSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-8 animate-pulse">
      {/* Summary skeleton */}
      <div className="rounded-3xl p-6 border border-gray-100 bg-white space-y-4">
        <div className="flex items-end gap-2">
          <div className="h-8 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-8 bg-gray-200 rounded" />
        </div>

        <div className="h-3 w-32 bg-gray-200 rounded" />

        {/* stars */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
          ))}
        </div>

        {/* breakdown */}
        <div className="space-y-3 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-4 h-3 bg-gray-200 rounded" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full" />
              <div className="w-6 h-3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list skeleton */}
      <div className="md:col-span-2 space-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <ReviewItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}