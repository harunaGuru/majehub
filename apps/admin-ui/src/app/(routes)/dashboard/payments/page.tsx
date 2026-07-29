'use client'
import { axiosInstance } from '@/utils/axiosInstance';
import { paginateData } from '@/utils/paginate';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React, { useState, useMemo } from 'react'
import { ChevronRight, Search, Loader2, Eye } from "lucide-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table"

const getOrders = async () => {
  const { data } = await axiosInstance.get(`/admin/api/get-all-orders`);
  return data.orders;
};

const PaymentPage = () => {
  const [page, setPage] = useState(1);
  const [globalFilter, setGlobalFilter] = useState("")
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  })
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Order ID",
        accessorKey: "id",
        cell: ({ row }) => <span>#{row.original.id.slice(-6)}</span>

      },
      {
        header: "Shop",
        accessorFn: (row) => row.shop?.name || "Unknown Shop",
        id: "shop",
        size: 350,
        cell: ({ row }) => {
          const name = row.original.shop?.name || "Unknown Shop";
          return (
            <div className="max-w-[350px] pr-5 truncate" title={name}>
              {name}
            </div>
          );
        },
      },
      {
        header: "Buyer",
        accessorFn: (row) => row.customer?.name || "Unknown Customer",
        id: "buyer",
      },
      {
        header: "Admin Fee(10%)",
        id: "adminFee",
        cell: ({ row }) => {
          const total = row.original.total
          const fee = total * 0.1
          return <span className='text-green-600'>${fee.toLocaleString()}</span>
        },
      },
      {
        header: "Seller Earnings",
        id: "sellerEarnings",
        cell: ({ row }) => {
          const total = row.original.total
          const earnings = total * 0.9
          return `$${earnings.toLocaleString()}`
        },
      },
      {
        header: "Payment Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${row.original.status === "Paid" ? "bg-green-600 text-white" : "bg-yellow-500 text-white"}`}>{row.original.status}</span>
        ),
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString("en-GB"),
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <Link href={`${process.env.NEXT_PUBLIC_USER_URL}/order/${row.original.id}`}>
            <Eye className="cursor-pointer text-blue-400 hover:text-blue-3000" size={18} />
          </Link>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const rows = table.getRowModel().rows;
  const paginated = paginateData(rows, page, 5);

  return (
    <div className="min-h-screen w-full flex flex-col p-4">
      <h1 className="font-poppins text-white font-semibold text-lg tracking-wide pl-4 lg:pl-0">
        All Payments
      </h1>
      <div className="flex items-center text-white mb-3 pl-4 lg:pl-0">
        <Link href="/dashboard" className="text-blue-500 opacity-80">
          Dashboard
        </Link>
        <span className="opacity-80">
          <ChevronRight size={20} />
        </span>
        <span>All Payments</span>
      </div>
      <div className="w-full bg-slate-800 flex items-center py-1 px-3 rounded-md my-4">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          placeholder="Search payments..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter ?? ""}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="w-full overflow-x-auto lg:overflow-x-hidden rounded-lg bg-slate-800">
        <div className="min-w-[700px] lg:min-w-full">
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-8 border-b border-gray-600 text-white text-sm font-semibold p-3">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <span key={header.id}>
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
            ) : rows.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                No Payments found
              </div>
            ) : (
              paginated.data.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-8 items-center border-b border-gray-700 text-sm text-gray-200 p-3 hover:bg-slate-700 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <span key={cell.id}>
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
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={!paginated.hasPrevPage}
                className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              <span className="text-sm">
                Page {paginated.page} of {paginated.totalPages}
              </span>

              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!paginated.hasNextPage}
                className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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

export default PaymentPage