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
import Image from "next/image";

type Seller = {
  id: string;
  name: string;
  email: string;
  shopId: string;
  shopName: string;
  address: string;
  avatar: string;
  createdAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type GetSellersResponse = {
  success: boolean;
  sellers: Seller[];
  pagination: Pagination;
};

const getSellers = async ({ queryKey }: any): Promise<GetSellersResponse> => {
  const [_key, page, limit] = queryKey;

  const { data } = await axiosInstance.get<GetSellersResponse>(
    `/admin/api/get-all-sellers?page=${page}&limit=${limit}`
  );

  return data;
};

const SellersPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [globalFilter, setGlobalFilter] = useState("")

  const { data, isLoading, isFetching } = useQuery<GetSellersResponse>({
    queryKey: ["sellers", page, limit],
    queryFn: getSellers,
    placeholderData: (previousData: any) => previousData,
  });
  const sellers = data?.sellers || [];
  const pagination = data?.pagination;
  const downloadCSV = (sellers: Seller[]) => {
    if (!sellers.length) return;

    const headers = [
      "ID",
      "Name",
      "Email",
      "Shop Name",
      "Address",
      "Joined",
    ];

    const rows = sellers.map((s) => [
      s.id,
      s.name,
      s.email,
      s.shopName || "",
      s.address || "",
      new Date(s.createdAt).toLocaleDateString("en-GB"),
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
    link.setAttribute("download", "sellers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const productColumns: ColumnDef<any>[] = [
    {
      header: "Image",
      accessorKey: "avatar",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image width={32} height={32} src={row.original.avatar || '/banner.jpg'} alt="Avatar" className="w-8 h-8 rounded-full" />
        </div>
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => {
        const name = row.original.name;
        return (
          <div
            className="text-gray-300 font-medium"
            title={name}
          >
            {name}
          </div>
        );
      },
    },

    {
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) => <p className='text-gray-300'>{row.original.email}</p>,
    },

    {
      header: "Shop Name",
      accessorKey: "shopName",
      cell: ({ row }) => <p className='text-gray-300'>{row.original.shopName}</p>,
    },

    {
      header: "Address",
      accessorKey: "address",
      cell: ({ row }) => <p className='text-gray-300'>{row.original.address}</p>,
    },

    {
      header: "Joined",
      accessorKey: "createdAt",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-GB")
    }
  ];

  const table = useReactTable({
    data: sellers,
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
          All Sellers
        </h1>
        <button
          onClick={() => downloadCSV(sellers)}
          className="flex mb-1 items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-md"
        >
          <Download size={16} />
          Download CSV
        </button>
      </div>
      <div className="flex items-center text-white mb-3 pl-4 lg:pl-0 -mt-2">
        <Link href="/dashboard" className="text-blue-500 opacity-80">
          Dashboard
        </Link>
        <span className="opacity-80">
          <ChevronRight size={20} />
        </span>
        <span>All Sellers</span>
      </div>
      <div className="w-full bg-slate-800 flex items-center py-1 px-3 rounded-md my-4">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          placeholder="Search sellers..."
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
            <div className="grid grid-cols-11 gap-1 border-b border-gray-600 text-white text-sm font-semibold p-3">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <span key={header.id} style={{ width: header.getSize() }} className={header.id === "email" ? "col-span-3" : header.id === "shopName" ? "col-span-2" : header.id === "address" ? "col-span-3" : ""}>
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
                No sellers found
              </div>
            ) : (
              table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-11 gap-1 items-center border-b border-gray-700 text-sm text-gray-200 p-3 hover:bg-slate-700 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <span key={cell.id} className={cell.column.id === "email" ? "col-span-3" : cell.column.id === "shopName" ? "col-span-2" : cell.column.id === "address" ? "col-span-3" : ""}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </span>
                  ))}
                </div>
              ))
            )}
            <div className="flex items-center justify-between px-4 my-4 text-white">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination?.hasPrevPage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-sm">
                Page {pagination?.page || 1} of {pagination?.totalPages || 1}
              </span>
              <button
                onClick={() =>
                  setPage((prev) =>
                    pagination?.hasNextPage ? prev + 1 : prev
                  )
                }
                disabled={!pagination?.hasNextPage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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

export default SellersPage