'use client'
import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React, { useState } from 'react'
import { ChevronRight, Search, Loader2, Download, Ban, RotateCcw } from "lucide-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table"
import toast from "react-hot-toast";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
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

type GetUsersResponse = {
  success: boolean;
  users: User[];
  pagination: Pagination;
};

const getUsers = async ({ queryKey }: any): Promise<GetUsersResponse> => {
  const [_key, page, limit, role] = queryKey;

  const { data } = await axiosInstance.get<GetUsersResponse>(
    `/admin/api/get-all-users?page=${page}&limit=${limit}&role=${role}`
  );

  return data;
};

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [banUserId, setBanUserId] = useState<string>("");
  const [banUserName, setBanUserName] = useState("");
  const [isBanUserModalOpen, setIsBanUserModalOpen] = useState(false);
  const [role, setRole] = useState<"" | "Admin" | "User">("");
  const [isRestoreUserModalOpen, setIsRestoreUserModalOpen] = useState(false);
  const [restoreUserId, setRestoreUserId] = useState<string | null>(null);
  const [restoreUserName, setRestoreUserName] = useState("");
  const limit = 5;
  const [globalFilter, setGlobalFilter] = useState("")

  const { data, isLoading, isFetching, refetch } = useQuery<GetUsersResponse>({
    queryKey: ["users", page, limit, role],
    queryFn: getUsers,
    placeholderData: (previousData: any) => previousData,
  });
  const users = data?.users || [];
  const pagination = data?.pagination;
  const downloadCSV = (users: User[]) => {
    if (!users.length) return;

    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Joined",
    ];

    const rows = users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.role || "",
      new Date(u.createdAt).toLocaleDateString("en-GB"),
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
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const productColumns: ColumnDef<any>[] = [
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
      header: "Role",
      accessorKey: "role",
      cell: ({ row }) => <p className='text-gray-300'>{row.original.role}</p>,
    },

    {
      header: "Joined",
      accessorKey: "createdAt",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-GB")
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        return user.isDeleted ? (
          // ✅ Restore Button
          <button
            className="text-green-500 hover:text-green-400"
            onClick={() =>
              handleRestoreUser({ id: user.id, name: user.name })
            }
          >
            <RotateCcw size={18} />
          </button>
        ) : (
          // ❌ Ban Button
          <button
            className="text-red-600 hover:text-red-400"
            onClick={() =>
              handleBanUser({ id: user.id, name: user.name })
            }
          >
            <Ban size={18} />
          </button>
        );
      },
    }
    // {
    //   header: "Actions",
    //   id: "actions",
    //   cell: ({ row }) => (
    //     <button className='text-red-600 hover:text-red-400' onClick={() => handleBanUser({ id: row.original.id, name: row.original.name })}>
    //       <Ban size={18} />
    //     </button>
    //   ),
    // }
  ];

  const handleBanUser = ({ id, name }: { id: string, name: string }) => {
    setBanUserId(id);
    setBanUserName(name);
    setIsBanUserModalOpen(true);
  }
  const handleRestoreUser = ({ id, name }: { id: string; name: string }) => {
    setRestoreUserId(id);
    setRestoreUserName(name);
    setIsRestoreUserModalOpen(true);
  };

  const handleRoleChange = async (role: "" | "Admin" | "User") => {
    setRole(role);
    setPage(1);
    await getUsers({ queryKey: ["users", page, limit, role] });
  }
  const banUser = async () => {
    const loadingToast = toast.loading("Banning user...");
    try {
      await axiosInstance.put(`/admin/api/ban-user`, { userId: banUserId });
      toast.success("User banned successfully", { id: loadingToast });
      setIsBanUserModalOpen(false);
      await refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to ban user",
        { id: loadingToast }
      );
      console.error("Ban User Error:", error);
    }
  }

  const restoreUser = async () => {
    if (!restoreUserId) return;
    const loadingToast = toast.loading("Restoring user...");
    try {
      await axiosInstance.put("/admin/api/restore-user", {
        userId: restoreUserId,
      });
      toast.success("User restored successfully", { id: loadingToast });
      setIsRestoreUserModalOpen(false);
      await refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to restore user",
        { id: loadingToast }
      );
      console.error("Restore User Error:", error);
    }
  };

  const UserActionModal = ({
    name,
    type,
  }: {
    name: string;
    type: "ban" | "restore";
  }) => {
    const isOpen =
      type === "ban" ? isBanUserModalOpen : isRestoreUserModalOpen;

    if (!isOpen || !name) return null;

    const isBan = type === "ban";

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 text-center">
          <div className="fixed inset-0 bg-black bg-opacity-50"></div>

          <div className="relative bg-slate-800 rounded-lg w-full max-w-md p-6 shadow-lg">
            <h3 className="text-lg font-medium text-white">
              {isBan ? "Ban User" : "Restore User"}
            </h3>

            <p className="text-sm text-start text-gray-400 leading-relaxed mt-2">
              <span className="text-yellow-400 font-medium">
                ⚠️ Important:
              </span>{" "}
              Are you sure you want to{" "}
              {isBan ? "ban" : "restore"}{" "}
              <span
                className={
                  isBan ? "text-red-400" : "text-green-400"
                }
              >
                {name}
              </span>
              ?{" "}
              {isBan
                ? "This action can be reverted later."
                : "The user will regain access."}
            </p>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() =>
                  isBan
                    ? setIsBanUserModalOpen(false)
                    : setIsRestoreUserModalOpen(false)
                }
                className="px-4 py-2 text-sm text-gray-400 bg-slate-700 hover:bg-slate-600 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  isBan ? banUser() : restoreUser()
                }
                className={`flex items-center gap-1 px-3 py-2 text-sm text-white rounded-md ${isBan
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {isBan ? <Ban size={16} /> : <RotateCcw size={16} />}
                {isBan ? "Confirm Ban" : "Restore User"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };



  const table = useReactTable({
    data: users,
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mt-2 sm:mt-0 mb-4 px-4 lg:px-0">
        <div>
          <h1 className="font-poppins text-white font-semibold text-xl tracking-wide">
            All Users
          </h1>

          <div className="flex items-center text-white mt-0 sm:mt-1 text-sm">
            <Link href="/dashboard" className="text-blue-500 hover:underline">
              Dashboard
            </Link>

            <ChevronRight size={16} className="mx-1 opacity-80" />

            <span className="opacity-80">All Users</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            onClick={() => downloadCSV(users)}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md w-full sm:w-auto"
          >
            <Download size={16} />
            Download CSV
          </button>

          <select
            value={role}
            onChange={(e) =>
              handleRoleChange(e.target.value as '' | 'Admin' | 'User')
            }
            className="bg-gray-700 text-white text-sm px-4 py-2 rounded-md w-full sm:w-40"
          >
            <option value="">All</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>
      <div className="w-full bg-slate-800 flex items-center py-1 px-3 rounded-md my-4">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          placeholder="Search users..."
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
          <div className="min-w-[700px]">
            <div className="grid grid-cols-6 border-b border-gray-600 text-white text-sm font-semibold p-3">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <span key={header.id} style={{ width: header.getSize() }} className={header.id === "email" ? "col-span-2" : ""}>
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
                No Users found
              </div>
            ) : (
              table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-6 items-center border-b border-gray-700 text-sm text-gray-200 p-3 hover:bg-slate-700 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <span key={cell.id} className={cell.column.id === "email" ? "col-span-2" : ""}>
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
      <UserActionModal name={banUserName} type="ban" />
      <UserActionModal name={restoreUserName} type="restore" />
    </div>
  )
}

export default UsersPage