"use client"
import React from 'react';
import {
  ChevronRight,
  PlusIcon,
  Search,
  SignalHigh,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, RotateCcw } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Product } from '@/config/types';
import Image from 'next/image';
import { EditProductModal } from "@/shared/components/Modals/EditProductModal";
import { DeleteRestoreModal } from "@/shared/components/Modals/DeleteRestoreModal";
import { Spinner } from "@/shared/components/Spinner";
import { ProductAnalyticsModal } from "@/shared/components/Modals/ProductAnalyticsModal";
import toast from 'react-hot-toast';

const getProducts = async (
  page: number,
  limit: number,
  search?: string
) => {
  const { data } = await axiosInstance.get(`/product/api/get-all-products`, {
    params: {
      page,
      limit,
      ...(search && { search }),
    },
  });
  return data;
};
const softDeleteProduct = async (id: string) => {
  return axiosInstance.patch(`/product/api/soft-delete-product/${id}`);
};

const restoreProduct = async (id: string) => {
  return axiosInstance.patch(`/product/api/restore-product/${id}`);
};
const columnHelper = createColumnHelper<Product>();

const ProdcutsPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // const [globalFilter, setGlobalFilter] = useState('');
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") || "";
  const [localSearch, setLocalSearch] = useState(searchParam);
  const router = useRouter();
  const [modalType, setModalType] = useState<'edit' | 'analytics' | 'delete' | null>(null);
  const queryClient = useQueryClient();
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const isServerSearch = searchParam.length >= 3;
  const { data, isLoading } = useQuery({
    queryKey: ['products', page, limit, searchParam],
    queryFn: () => getProducts(page, limit, isServerSearch ? searchParam : undefined),
  });

  const editProductMutation = useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: any;
    }) => {
      const response = await axiosInstance.put(
        `/product/api/edit-product/${productId}`,
        data
      );

      return response.data;
    },

    onSuccess: (data) => {
      toast.success(data.message || 'Product updated successfully');

      // Refetch products table
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });

      setModalType(null);
      setSelectedProduct(null);
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
        'Failed to update product'
      );
    },
  });

  const handleEditProduct = async (formData: any) => {
    if (!selectedProduct?.id) return;

    editProductMutation.mutate({
      productId: selectedProduct.id,
      data: formData,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: softDeleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setModalType(null);
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setModalType(null);
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error('Failed to restore product:', error);
    },
  });

  const updateUrl = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`?${params.toString()}`);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('images', {
        header: 'Image',
        cell: (info) => {
          const image = info.getValue()?.[0]?.fileUrl;

          return (
            <Image
              src={
                image ||
                'https://ik.imagekit.io/3k74bqena/products/earbud2_TDPPEGhoua.webp'
              }
              alt={`Product image of ${info.row.original.title}`}
              width={50}
              height={50}
              className="rounded-md p-1 w-12 h-12 object-cover"
            />
          );
        },
      }),
      columnHelper.accessor('title', {
        header: 'Product Name',
        cell: (info) => (
          <Link href={`${process.env.NEXT_PUBLIC_USER_URL}/product/${info.row.original.slug}`} className="w-full text-blue-500 hover:text-blue-400 max-w-full truncate">{info.getValue()}</Link>
        ),
      }),
      columnHelper.accessor('sale_price', {
        header: 'Price',
        cell: (info) => `$${info.getValue().toLocaleString()}`,
      }),
      columnHelper.accessor('stock', { header: 'Stock' }),
      columnHelper.accessor('category', { header: 'Category' }),
      columnHelper.accessor('ratings', {
        header: 'Rating',
        cell: ({ getValue }) => {
          const rating = getValue() ?? 0;

          return (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-200 fill-yellow-200" />
              <span className="text-sm">{rating}</span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const product = row.original;

          return (
            <div className="flex gap-2">
              {/* View Page */}
              <a
                href={`${process.env.NEXT_PUBLIC_USER_URL}/product/${product.slug}`}
              >
                <Eye className="w-4 h-4 cursor-pointer hover:text-blue-400 transition" />
              </a>

              {/* Edit */}
              <Pencil
                className="w-4 h-4 cursor-pointer hover:text-blue-400 transition"
                onClick={() => {
                  setSelectedProduct(product);
                  setModalType('edit');
                }}
              />

              {/* View Modal */}
              <SignalHigh
                className="w-4 h-4 cursor-pointer hover:text-blue-400 transition"
                onClick={() => {
                  setSelectedProduct(product);
                  setModalType('analytics');
                }}
              />

              {/* Delete / Restore */}
              {product.isDeleted ? (
                <RotateCcw
                  className="w-4 h-4 cursor-pointer text-green-500"
                  onClick={() => {
                    setSelectedProduct(product);
                    setModalType('delete');
                  }}
                />
              ) : (
                <Trash2
                  className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-400 transition"
                  onClick={() => {
                    setSelectedProduct(product);
                    setModalType('delete');
                  }}
                />
              )}
            </div>
          );
        },
      }),
    ],
    []
  );
  const table = useReactTable({
    data: data?.products ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter: !isServerSearch ? localSearch : undefined },
    onGlobalFilterChange: setLocalSearch,
  });

  const goToPage = (newPage: number) => {
    router.push(`?page=${newPage}`);
  };
  return (
    <div className="h-screen w-full flex flex-col p-4">
      <div className="flex items-center justify-between pl-10 lg:pl-0">
        <h1 className="font-poppins text-white font-semibold text-lg tracking-wide">
          All Products
        </h1>
        <Link
          href="/dashboard/create-product"
          className="flex items-center text-sm gap-2 bg-blue-600 hover:bg-blue-500 transition p-2 rounded-md font-poppins text-white"
        >
          <PlusIcon size={16} color="white" />
          Add Product
        </Link>
      </div>
      {/*BreadCrumbs*/}
      <div className="flex items-center text-white mb-3 pl-10 lg:pl-0 -mt-2">
        <Link href="/dashboard" className="text-blue-500 opacity-80">
          Dashboard
        </Link>
        <span className="opacity-80">
          <ChevronRight size={20} />
        </span>
        <span>All Products</span>
      </div>
      <div className="w-full border border-gray-700 flex items-center p-2 rounded-md my-4">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          placeholder="Search Products...."
          type="text"
          className="w-full bg-transparent text-white outline-none"
          value={localSearch}
          onChange={(e) => {
            const value = e.target.value;
            setLocalSearch(value);

            if (value.length >= 3) {
              updateUrl({ search: value, page: 1 });
            } else {
              updateUrl({ search: null });
            }
          }}
        />
      </div>
      <div className="text white bg-slate-700 w-full px-6 py-2 text-white/80 text-sm rounded-sm">
        {/* 📊 Table */}
        <table className="w-full border-collapse text-white space-y-3.5">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="text-left">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center"
                >
                  <Spinner />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-500"
                >
                  No Product Available yet
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* 🔄 Pagination Controls */}
        <div className="flex justify-between mt-6">
          <button
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {page} of {data?.meta?.totalPages}
          </span>

          <button
            disabled={page >= (data?.meta?.totalPages ?? 1)}
            onClick={() => goToPage(page + 1)}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {/* Modals */}
      {modalType === 'edit' && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setModalType(null)}
          onSave={handleEditProduct}
          isLoading={editProductMutation.isPending}
        />
      )}

      {
        modalType === "analytics" &&
        selectedProduct && (
          <ProductAnalyticsModal
            product={selectedProduct}
            onClose={() => setModalType(null)}
          />
        )}

      {modalType === 'delete' && selectedProduct && (
        <DeleteRestoreModal
          product={selectedProduct}
          onClose={() => setModalType(null)}
          onDelete={() => deleteMutation.mutate(selectedProduct.id)}
          onRestore={() => restoreMutation.mutate(selectedProduct.id)}
          isDeletePending={deleteMutation.isPending}
          isRestorePending={restoreMutation.isPending}
        />
      )}
    </div>
  );
};
export default ProdcutsPage;
