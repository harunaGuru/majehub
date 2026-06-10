import { SearchX } from "lucide-react";

function NoShopsFound() {
  return (
    <div className="flex flex-col w-full lg:pl-36  items-center justify-center py-20 text-center gap-4">

      <div className="p-6 rounded-full bg-gray-100">
        <SearchX size={48} className="text-gray-400" />
      </div>

      <h2 className="text-xl font-semibold text-gray-800">
        No Shops found
      </h2>

      <p className="text-gray-500 max-w-sm">
        We couldn't find any Shop matching your filters. Try adjusting your  category, filters.
      </p>

      <button
        onClick={() => (window.location.href = "/shops")}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Clear Filters
      </button>

    </div>
  );
}
export default NoShopsFound;