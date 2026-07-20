'use client'
import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React, { useState } from 'react'
import { ChevronRight, Search, Loader2, Eye, Download } from "lucide-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table"
import Image from 'next/image'

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  date: string;
  image?: string | null;
  category?: string;
  subCategory?: string;
  ratings?: number;
  shop?: {
    id?: string;
    name?: string;
  };
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type GetProductsResponse = {
  success: boolean;
  data: Product[];
  pagination: Pagination;
};

const getProducts = async ({ queryKey }: any): Promise<GetProductsResponse> => {
  const [_key, page, limit] = queryKey;

  const { data } = await axiosInstance.get<GetProductsResponse>(
    `/admin/api/get-all-products?page=${page}&limit=${limit}`
  );

  return data;
};

const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const limit = 5;
  const [globalFilter, setGlobalFilter] = useState("")

  const { data, isLoading, isFetching } = useQuery<GetProductsResponse>({
    queryKey: ["products", page, limit],
    queryFn: getProducts,
    placeholderData: (previousData) => previousData,
  });
  const products = data?.data || [];
  const pagination = data?.pagination;
  const downloadCSV = (products: Product[]) => {
    if (!products.length) return;

    const headers = [
      "ID",
      "Name",
      "Price",
      "Stock",
      "Category",
      "Ratings",
      "Shop",
      "Date",
    ];

    const rows = products.map((p) => [
      p.id,
      p.name,
      p.price,
      p.stock,
      p.category || "",
      p.ratings ?? 0,
      p.shop?.name || "Unknown",
      new Date(p.date).toLocaleDateString("en-GB"),
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const productColumns: ColumnDef<any>[] = [
    {
      header: "Image",
      accessorKey: "image",
      cell: ({ row }) => {
        const image = row.original.image;

        return (
          <div className="w-10 h-10 relative">
            <Image
              src={image || "/placeholder.png"}
              alt="product"
              fill
              className="object-cover rounded-full"
            />
          </div>
        );
      },
      size: 70,
    },

    {
      header: "Title",
      accessorKey: "name",
      size: 400, // 👈 wide column
      cell: ({ row }) => {
        const title = row.original.name;

        return (
          <div
            className="max-w-[400px] truncate font-medium text-blue-400"
            title={title}
          >
            {title}
          </div>
        );
      },
    },

    {
      header: "Price",
      accessorKey: "price",
      cell: ({ row }) => `$${row.original.price}`,
    },

    {
      header: "Stock",
      accessorKey: "stock",
      cell: ({ row }) => `${row.original.stock} Left`,
    },

    {
      header: "Category",
      accessorFn: (row) => row.category || "—",
      id: "category",
      cell: ({ row }) => {
        const category = row.original.category?.split(" ")[0] || "—";

        return (
          <div className="max-w-[180px] pr-5" title={category}>
            {category}
          </div>
        );
      },
    },

    {
      header: "Rating",
      accessorKey: "ratings",
      cell: ({ row }) => row.original.ratings?.toFixed(1) || "0.0",
    },

    {
      header: "Shop",
      accessorFn: (row) => row.shop?.name || "Unknown",
      id: "shop",
      cell: ({ row }) => {
        const name = row.original.shop?.name ? row.original.shop?.name.split(" ")[0] : "Unknown";

        return (
          <div className="max-w-[180px] pr-5" title={name}>
            {name}
          </div>
        );
      },
    },

    {
      header: "Created",
      accessorKey: "date",
      cell: ({ row }) =>
        new Date(row.original.date).toLocaleDateString("en-GB")
    },

    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <Link href={`/product/${row.original.id}`} >
          <Eye className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer" />
        </Link>
      ),
      size: 80,
    },
  ];

  const table = useReactTable({
    data: products,
    columns: productColumns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="min-h-screen w-full flex flex-col p-4">
      <div className="flex items-center justify-between pl-4 lg:pl-0">
        <h1 className="font-poppins text-white font-semibold text-lg tracking-wide">
          All Products
        </h1>

        <button
          onClick={() => downloadCSV(products)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded-md"
        >
          <Download size={16} />
          Download CSV
        </button>
      </div>
      <div className="flex items-center text-white mb-3 pl-4 lg:pl-0 -mt-1">
        <Link href="/dashboard" className="text-blue-500 opacity-80">
          Dashboard
        </Link>
        <span className="opacity-80">
          <ChevronRight size={20} />
        </span>
        <span>All Products</span>
      </div>
      <div className="w-full bg-slate-800 flex items-center py-1 px-3 rounded-md my-4">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          placeholder="Search products..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="bg-slate-800 rounded-lg">
        {isFetching && !isLoading && (
          <div className="text-center text-gray-400 py-2 text-sm">
            Updating...
          </div>
        )}
        <div className="w-full overflow-x-auto rounded-lg bg-slate-800">
          <div className="min-w-[950px]">
            <div className="grid grid-cols-11 border-b border-gray-600 text-white text-sm font-semibold p-3">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <span key={header.id} style={{ width: header.getSize() }} className={header.id === "name" ? "col-span-3" : ""}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </span>
                ))
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin text-white" />
              </div>
            ) : table.getRowModel().rows.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                No Products found
              </div>
            ) : (
              table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-11 items-center border-b border-gray-700 text-sm text-gray-200 p-3 hover:bg-slate-700 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <span key={cell.id} className={cell.column.id === "name" ? "col-span-3" : ""}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </span>
                  ))}
                </div>
              ))
            )}
            {/* pagination */}
            <div className="flex items-center justify-between px-4 my-4 text-white">
              {/* Prev */}
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination?.hasPrevPage}
                className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              {/* Middle Info */}
              <span className="text-sm">
                Page {pagination?.page || 1} of {pagination?.totalPages || 1}
              </span>

              {/* Next */}
              <button
                onClick={() =>
                  setPage((prev) =>
                    pagination?.hasNextPage ? prev + 1 : prev
                  )
                }
                disabled={!pagination?.hasNextPage}
                className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage