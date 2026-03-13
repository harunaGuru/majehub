import { SearchX } from "lucide-react";

function NoProductsFound() {
  return (
    <div className="flex flex-col w-full lg:pl-36  items-center justify-center py-20 text-center gap-4">

      <div className="p-6 rounded-full bg-gray-100">
        <SearchX size={48} className="text-gray-400" />
      </div>

      <h2 className="text-xl font-semibold text-gray-800">
        No products found
      </h2>

      <p className="text-gray-500 max-w-sm">
        We couldn't find any products matching your filters. Try adjusting your
        price range, category, or other filters.
      </p>

      <button
        onClick={() => (window.location.href = "/products")}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Clear Filters
      </button>

    </div>
  );
}
export default NoProductsFound;