'use client'
import { axiosInstance } from '@/utils/axiosInstance';
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
  const { data } = await axiosInstance.get(`/order/api/seller-orders`);
  return data.orders;
};

const OrdersPage = () => {
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
        cell: ({ row }) => (
          <span>#{row.original.id.slice(-6)}</span>

        ),
      },
      {
        header: "Buyer",
        accessorFn: (row) => row.customer?.name || "Customer",
        id: "buyer",
      },
      {
        header: "Total",
        accessorKey: "total",
        cell: ({ row }) => `$${row.original.total.toLocaleString()}`,
      },
      {
        header: "Status",
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
          <Link href={`/order/${row.original.id}`}>
            <Eye className="cursor-pointer text-blue-400 hover:text-blue-300" size={18} />
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

  return (
    <div className="h-screen w-full flex flex-col p-4">
      <h1 className="font-poppins text-white font-semibold text-lg tracking-wide pl-10 lg:pl-0">
        All Orders
      </h1>
      <div className="flex items-center text-white mb-3 pl-10 lg:pl-0">
        <Link href="/dashboard" className="text-blue-500 opacity-80">
          Dashboard
        </Link>
        <span className="opacity-80">
          <ChevronRight size={20} />
        </span>
        <span>All Orders</span>
      </div>
      <div className="w-full bg-slate-800 flex items-center py-1 px-3 rounded-md my-4">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          placeholder="Search orders..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 border-b border-gray-600 text-white text-sm font-semibold p-3">
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
        ) : table.getRowModel().rows.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            No orders found
          </div>
        ) : (
          table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-6 items-center border-b border-gray-700 text-sm text-gray-200 p-3 hover:bg-slate-700 transition"
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
      </div>
    </div>
  )
}

export default OrdersPage