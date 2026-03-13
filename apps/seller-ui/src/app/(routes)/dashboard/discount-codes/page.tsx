"use client"
import React, {useState} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/utils/axiosInstance';
import { ChevronRight, PlusIcon, Trash } from 'lucide-react';
import Link from 'next/link';
import {Spinner} from '@/shared/components/Spinner';
import CreateDiscountModal from '@/shared/components/Modals/CreateDiscountModal';

type DiscountType = 'Percentage' | 'Flat';
type Discount = {
  discountCode: string;
  public_name: string;
  discountType: DiscountType;
  discountValue: number;
  id: string;
};
const DiscountPage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/product/api/delete-discount/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['shop-discount'],
      });
    },
  });

  const handleDelete =  () => {
    if(!selectedId) return
    deleteMutation.mutate(selectedId,{
      onSuccess: () => {
        setSelectedId(null);
      }
    })

  };
  const handleModal = ()=>{
    setOpenModal(true);
  }
  const {data=[], isLoading, error} = useQuery({
    queryKey: ['shop-discount'],
    queryFn: async () => {
      const response = await axiosInstance.get(
        '/product/api/discounts'
      );
      return response.data.discounts;
    }
  })

  return (
    <div className="min-h-screen w-full flex flex-col p-4">
      <div className="mt-6 flex items-center justify-between">
        <h1 className="font-poppins text-white font-semibold text-lg tracking-wide">
          Discount Codes
        </h1>
        <button onClick={handleModal} className="flex items-center text-sm gap-2 bg-blue-600 hover:bg-blue-500 transition p-2 rounded-md font-poppins text-white">
          <PlusIcon size={16} color="white" />
          create discount
        </button>
      </div>
      {/*BreadCrumbs*/}
      <div className="flex items-center text-white mb-6">
        <Link href="/dashboard" className="text-blue-500 opacity-80">
          Dashboard
        </Link>
        <span className="opacity-80">
          <ChevronRight size={20} />
        </span>
        <span>Create Discount</span>
      </div>
      <div className="text white bg-slate-700 w-full px-4 py-2 text-white/80 text-sm rounded-sm">
        <h3 className="mb-2">Your Discount Codes</h3>
        <table className="md:w-[90%] w-full border-collapse text-sm px-0">
          <thead className="text-sm text-white font-normal">
            <tr>
              <th className="text-left font-normal">Title</th>
              <th className="text-left font-normal">Type</th>
              <th className="text-left font-normal">Value</th>
              <th className="text-left font-normal">Code</th>
              <th className="text-left font-normal">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-2 text-center text-gray-400">
                  No Discount Code Available
                </td>
              </tr>
            ) : isLoading ? (
                <tr>
                  <td colSpan={5} className="p-2 text-center text-gray-400">
                    <Spinner />
                  </td>
                </tr>
            ): (
              data && !error && data.map((discount: Discount) => (
                <tr key={discount.id} className="text-center">
                  <td className="text-left font-normal py-3">{discount.public_name}</td>
                  <td className="text-left font-normal py-3">{discount.discountType}</td>
                  <td className="text-left font-normal py-3">{discount.discountValue}</td>
                  <td className="text-left font-normal py-3">{discount.discountCode}</td>
                  <td className="text-left font-normal py-3">
                    <button
                      onClick={() => setSelectedId(discount.id)}
                      // className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                    >
                      <Trash size={16} className='text-red-600 hover:text-red-700' />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {openModal && (
        <CreateDiscountModal open={openModal} onClose={() => setOpenModal(false)} />
      )}
      {/* MODAL */}
      {selectedId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg w-[350px]">
            <h2 className="text-lg font-semibold mb-3">Delete Discount</h2>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to delete this discount code? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedId(null)}
                className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DiscountPage;
