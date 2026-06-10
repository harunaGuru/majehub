'use client'
import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React, { useState } from 'react'
import { ChevronRight, Search, Loader2, Download } from "lucide-react"
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
  start: string;
  end: string;
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

const getEvents = async ({ queryKey }: any): Promise<GetProductsResponse> => {
  const [_key, page, limit] = queryKey;

  const { data } = await axiosInstance.get<GetProductsResponse>(
    `/admin/api/get-all-events?page=${page}&limit=${limit}`
  );

  return data;
};

const EventsPage = () => {
  const [page, setPage] = useState(1);
  const limit = 5;
  const [globalFilter, setGlobalFilter] = useState("")

  const { data, isLoading, isFetching } = useQuery<GetProductsResponse>({
    queryKey: ["events", page, limit],
    queryFn: getEvents,
    placeholderData: (previousData: any) => previousData,
  });
  const events = data?.data || [];
  const pagination = data?.pagination;

  const downloadCSV = (events: Product[]) => {
    if (!events.length) return;

    const headers = [
      "ID",
      "Name",
      "Price",
      "Stock",
      "Start",
      "End",
      "Shop",
    ];

    const rows = events.map((p) => [
      p.id,
      p.name,
      p.price,
      p.stock,
      p.start || "",
      p.end ?? 0,
      p.shop?.name || "Unknown",
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
    link.setAttribute("download", "events.csv");
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
      size: 400,
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
      header: "Start",
      accessorKey: "start",
      cell: ({ row }) =>
        new Date(row.original.start).toLocaleDateString("en-GB")
    },

    {
      header: "End",
      accessorKey: "end",
      cell: ({ row }) =>
        new Date(row.original.end).toLocaleDateString("en-GB")
    },

    {
      header: "Shop Name",
      accessorFn: (row) => row.shop?.name || "Unknown",
      id: "shop",
      cell: ({ row }) => {
        const name = row.original.shop?.name ? row.original.shop?.name.split(" ")[0] : "Unknown";

        return (
          <div className="max-w-[180px] truncate pr-5" title={name}>
            {name}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: events,
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
      <div className="flex items-center justify-between">
        <h1 className="font-poppins text-white font-semibold text-lg tracking-wide">
          All Events
        </h1>

        <button
          onClick={() => downloadCSV(events)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded-md"
        >
          <Download size={16} />
          Download CSV
        </button>
      </div>
      <div className="flex items-center text-white mb-3">
        <Link href="/dashboard" className="text-blue-500 opacity-80">
          Dashboard
        </Link>
        <span className="opacity-80">
          <ChevronRight size={20} />
        </span>
        <span>All Events</span>
      </div>
      <div className="w-full bg-slate-800 flex items-center py-1 px-3 rounded-md my-4">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          placeholder="Search events..."
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
        <div className="grid grid-cols-9 border-b border-gray-600 text-white text-sm font-semibold p-3">
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
            No Events found
          </div>
        ) : (
          table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-9 items-center border-b border-gray-700 text-sm text-gray-200 p-3 hover:bg-slate-700 transition"
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
  )
}

export default EventsPage