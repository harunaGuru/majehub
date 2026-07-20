'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/utils/axiosInstance';
import { Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

const deliveryStatus = [
  'Ordered',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const OrderPage = () => {
  const { orderId } = useParams();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/seller/order/${orderId}`);

      return res.data.order;
    },
  });

  const currentStatusIndex = deliveryStatus.findIndex(
    (status) => status.toLowerCase() === order?.deliveryStatus?.toLowerCase()
  );

  const truncateId = (id: string) => {
    return id.slice(0, 6);
  };

  // UPDATE DELIVERY STATUS
  const { mutate: updateDeliveryStatus, isPending } = useMutation({
    mutationFn: async (status: string) => {
      const res = await axiosInstance.put(
        `/order/api/seller/order/${orderId}/delivery-status`,
        {
          deliveryStatus: status.toLowerCase(),
        }
      );

      return res.data;
    },

    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({
        queryKey: ['order', orderId],
      });

      const previousOrder = queryClient.getQueryData(['order', orderId]);

      // OPTIMISTIC UPDATE
      queryClient.setQueryData(['order', orderId], (old: any) => ({
        ...old,
        deliveryStatus: newStatus,
      }));

      return { previousOrder };
    },

    onError: (error: any, _, context) => {
      // ROLLBACK
      queryClient.setQueryData(['order', orderId], context?.previousOrder);

      toast.error(
        error?.response?.data?.message || 'Failed to update delivery status'
      );
    },

    onSuccess: () => {
      toast.success('Delivery status updated');
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['order', orderId],
      });
    },
  });

  return (
    <div className="w-full min-h-screen bg-[#0C1220] text-white">
      <div className="w-[90%] lg:max-w-3xl mx-auto py-3">
        {/* back to dashboard */}
        <button
          className="flex items-center gap-1 text-white text-sm p-2 hover:gap-2 transition-all duration-300"
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* ORDER SECTION */}
            <div className="px-4 rounded-xl shadow-sm">
              <div className="flex flex-col gap-3 mb-4">
                {/* ORDER TITLE */}
                <h1 className="text-lg font-bold">
                  {`Order - #${truncateId(order?.id)}`}
                </h1>

                {/* UPDATE DELIVERY STATUS */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    Update Delivery Status
                  </span>

                  <select
                    disabled={isPending}
                    value={
                      order?.deliveryStatus
                        ? deliveryStatus.find(
                          (status) =>
                            status.toLowerCase() ===
                            order?.deliveryStatus?.toLowerCase()
                        ) || 'Ordered'
                        : 'Ordered'
                    }
                    onChange={(e) => updateDeliveryStatus(e.target.value)}
                    className="bg-[#111827] border border-gray-700 text-sm text-gray-300 rounded-md px-3 py-2 outline-none"
                  >
                    {deliveryStatus.map((status, index) => (
                      <option
                        key={status}
                        value={status.toLowerCase()}
                        disabled={index < currentStatusIndex}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Desktop Horizontal Progress Bar */}
              <div className="hidden sm:block">
                {/* STATUS TEXT */}
                <div className="flex justify-between text-sm mb-2">
                  {deliveryStatus.map((status, index) => (
                    <span
                      key={index}
                      className={`text-left flex-1 ${index <= currentStatusIndex
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-500'
                        }`}
                    >
                      {status}
                    </span>
                  ))}
                </div>

                {/* PROGRESS BAR */}
                <div className="flex items-center justify-between">
                  {deliveryStatus.map((_, index) => (
                    <div key={index} className="flex items-center flex-1">
                      {/* CIRCLE */}
                      <div
                        className={`w-4 h-4 rounded-full ${index <= currentStatusIndex
                          ? 'bg-blue-600'
                          : 'bg-gray-300'
                          }`}
                      />

                      {/* BAR */}
                      {index !== deliveryStatus.length - 1 && (
                        <div
                          className={`h-1 flex-1 ${index <= currentStatusIndex
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                            }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Vertical Progress Bar */}
              <div className="flex flex-col gap-4 sm:hidden pl-2">
                {deliveryStatus.map((status, index) => {
                  const isActive = index <= currentStatusIndex;
                  return (
                    <div key={index} className="flex items-start gap-3 relative">
                      {/* Vertical line connector */}
                      {index !== deliveryStatus.length - 1 && (
                        <div
                          className={`absolute left-[7px] top-4 w-[2px] h-[calc(100%+16px)] ${
                            index < currentStatusIndex ? 'bg-blue-600' : 'bg-gray-700'
                          }`}
                        />
                      )}
                      {/* Step circle */}
                      <div
                        className={`w-4 h-4 rounded-full z-10 shrink-0 mt-1 ${
                          isActive ? 'bg-blue-600' : 'bg-gray-700'
                        }`}
                      />
                      {/* Step label */}
                      <span
                        className={`text-sm ${
                          isActive ? 'text-blue-500 font-medium' : 'text-gray-500'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ORDER META */}
              <div className="mt-5 flex flex-col gap-2 text-sm font-roboto text-gray-500">
                <span>
                  <span className="font-semibold">Payment Status:</span>{' '}
                  <span className="text-green-700 font-medium">
                    {order.status}
                  </span>
                </span>

                <span>
                  <span className="font-semibold">Total:</span>{' '}
                  <span className="font-medium text-gray-500">
                    ${order.total}
                  </span>
                </span>

                <span>
                  <span className="font-semibold">Date:</span>{' '}
                  <span className="font-medium text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </span>
              </div>

              {/* SHIPPING ADDRESS */}
              <div className="mt-5">
                <h2 className="font-semibold text-gray-500">
                  Shipping Address
                </h2>

                <div className="font-medium flex flex-col gap-2 text-sm font-roboto text-gray-500">
                  <span>{order.shippingAddress.label}</span>

                  <span>
                    {order.shippingAddress.street}, {order.shippingAddress.city}
                    , {order.shippingAddress.country}
                  </span>
                </div>
              </div>
            </div>

            {/* ORDER ITEMS */}
            <div className="px-4">
              <h2 className="text-lg font-semibold mb-3 text-gray-500">
                Order Items
              </h2>

              <div className="flex flex-col gap-3">
                {order?.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border border-gray-500 p-3 rounded-lg"
                  >
                    {/* LEFT SIDE */}
                    <div className="flex gap-3">
                      <Image
                        src={item.image}
                        alt={item.title || 'Product image'}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-md"
                      />

                      <div className="flex flex-col text-sm text-gray-500 font-roboto">
                        <span className="font-medium">
                          {item.title || 'Product'}
                        </span>

                        <span>Quantity: {item.quantity}</span>

                        {item.selectedOption &&
                          Object.entries(item.selectedOption).map(
                            ([key, value]: any) => (
                              <span key={key} className="text-gray-500">
                                {key}: {value.join(', ')}
                              </span>
                            )
                          )}
                      </div>
                    </div>

                    {/* PRICE */}
                    <span className="font-semibold text-sm">${item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
