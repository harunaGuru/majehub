'use client'
import { axiosInstance } from '@/utils/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Loader2 } from "lucide-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface GetAdminsResponse {
  users: User[];
}

const getAdmins = async (): Promise<GetAdminsResponse> => {


  const { data } = await axiosInstance.get<GetAdminsResponse>(
    `/admin/api/get-all-users?page=${1}&limit=${1000}&role=Admin`
  );

  return data;
};

const addAdmin = async (email: string) => {
  try {
    await axiosInstance.post('/admin/api/add-new-admin', { email });
    return { success: true, message: 'Admin added successfully' };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Failed to add admin' };
  }
}

const ManagementPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<GetAdminsResponse>({
    queryKey: ["users"],
    queryFn: getAdmins,
    placeholderData: (previousData: any) => previousData,
  });

  const admins = data?.users || [];

  const { mutateAsync } = useMutation({
    mutationFn: addAdmin,
    onSuccess: () => {
      toast.success('Admin added successfully', {
        icon: "✅",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add admin', {
        icon: "❌",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateAsync(email);
    setIsAddModalOpen(false);
    setEmail("");
  }

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEmail("");
  }

  const AddAdminModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        {/* Modal */}
        <div className="relative w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-6">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Add Admin
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Enter the email address of the user you want to promote to admin.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@example.com"
                className="w-full bg-slate-700 text-white placeholder-gray-400 border border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Add Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const adminColumns: ColumnDef<any>[] = [
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
    }
  ];

  const table = useReactTable({
    data: admins,
    columns: adminColumns,
    getCoreRowModel: getCoreRowModel(),
  })


  return (
    <div className="min-h-screen w-full flex flex-col p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-poppins text-white font-semibold text-lg tracking-wide">
          Team Management
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className=" cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1.5 rounded-2xl"
        >
          Add Admin
        </button>
      </div>
      <div className="flex items-center text-white mb-3">
        <Link href="/dashboard" className="text-blue-500 opacity-80">
          Dashboard
        </Link>
        <span className="opacity-80">
          <ChevronRight size={20} />
        </span>
        <span>Team Management</span>
      </div>

      <div className="bg-slate-800 rounded-lg">
        <div className="grid grid-cols-3 border-b border-gray-600 text-white text-sm font-semibold p-3">
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
            No Admins found
          </div>
        ) : (
          table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-3 items-center border-b border-gray-700 text-sm text-gray-200 p-3 hover:bg-slate-700 transition"
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
      {isAddModalOpen && <AddAdminModal />}
    </div>
  )
}

export default ManagementPage