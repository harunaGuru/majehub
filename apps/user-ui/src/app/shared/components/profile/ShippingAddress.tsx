import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { axiosInstance } from '@/utils/axiosInstance'
import { isProtected } from '@/utils/isProtected'
import AddAddressModal from './AddAddressModal'
import { MapPin, Trash } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

const ShippingAddress = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient()
  const { data: addresses, isLoading } = useQuery({
    queryKey: ["user-address"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/user/api/get-user-address", isProtected())
      return data.data
    }
  })

  const { mutate: deleteAddress } = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`/user/api/delete-user-address/${id}`, isProtected())
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-address"] })
    }
  })
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
      <div className="flex justify-between mb-4">
        <p className=' font-semibold'>Your Saved Addresses</p>
        <button onClick={() => setIsOpen(true)} className='text-blue-600 font-semibold text-sm'>+ Add New Address</button>
      </div>
      {isOpen && <AddAddressModal onClose={() => setIsOpen(false)} />}
      <div>
        {isLoading ? (
          <p className='text-sm text-gray-500'>Loading Addresses...</p>
        ) : addresses?.length === 0 ? (
          <p className='text-sm text-gray-500'>No saved addresses found</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {addresses?.map((address: any) => (
              <div key={address._id} className="border border-gray-200 p-4 rounded-md relative">
                {address.isDefault && (
                  <span className="absolute top-2 right-2 md:right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">Default</span>
                )}
                <div className='flex items-start gap-2 text-sm text-gray-700'>
                  <MapPin className='w-5 h-5 text-gray-500 mt-0.5' />
                  <div>
                    <p className='font-medium capitalize'>{address.label}- {address.name}</p>
                    <p>{address.street}, {address.city}, {address.zip}, {address.country}</p>
                  </div>
                </div>
                <div className='flex gap-3 mt-4'>
                  <button onClick={() => deleteAddress(address.id)} className='text-red-600 font-semibold text-sm flex items-center gap-1'><Trash className='w-4 h-4' /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShippingAddress