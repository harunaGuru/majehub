"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "@/utils/axiosInstance"
import { Loader2 } from "lucide-react"
import Image from "next/image"

const deliveryStatus = [
  "Ordered",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
]

const OrderPage = () => {
  const { orderId } = useParams()

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/order/api/order/${orderId}`,
      )
      return res.data.order
    },
  })

  const currentStatusIndex = deliveryStatus.findIndex(
    (status) => status.toLowerCase() === order?.deliveryStatus?.toLowerCase()
  )

  const truncateId = (id: string) => {
    return id?.slice(0, 6);
  };

  return (
    <div className="w-full min-h-[70vh] bg-gray-200">
      <div className="w-[90%] lg:max-w-3xl mx-auto py-5">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* ORDER SECTION */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h1 className="text-lg font-bold mb-4">{`Order - #${truncateId(order?.id)}`}</h1>

              {/* STATUS TEXT */}
              <div className="flex justify-between text-sm mb-2">
                {deliveryStatus.map((status, index) => (
                  <span
                    key={index}
                    className={`text-left flex-1 ${index <= currentStatusIndex
                      ? "text-blue-600 font-medium"
                      : "text-gray-500"
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
                        ? "bg-blue-600"
                        : "bg-gray-300"
                        }`}
                    />

                    {/* BAR (not last) */}
                    {index !== deliveryStatus.length - 1 && (
                      <div
                        className={`h-1 flex-1 ${index <= currentStatusIndex
                          ? "bg-blue-600"
                          : "bg-gray-300"
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* ORDER META */}
              <div className="mt-5 flex flex-col gap-2 text-sm font-roboto text-gray-500">
                <span>
                  <span className="font-semibold">Payment Status:</span> <span className="text-green-600 font-medium">{order?.status}</span>
                </span>
                <span>
                  <span className="font-semibold">Total:</span> <span className="font-medium text-gray-500">${order?.total}</span>
                </span>
                <span>
                  <span className="font-semibold">Discount:</span> <span className="font-medium text-gray-500">${order?.discountAmount ? order?.discountAmount : 0}</span>
                </span>
                <span>
                  <span className="font-semibold">Date:</span> {" "}
                  <span className="font-medium text-gray-500">{new Date(order?.createdAt).toLocaleDateString("en-GB")}</span>
                </span>
              </div>
            </div>

            {/* ORDER ITEMS */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Order Items</h2>

              <div className="flex flex-col gap-3">
                {order?.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border border-gray-200 bg-stone-100 p-3 rounded-lg"
                  >
                    {/* LEFT SIDE */}
                    <div className="flex gap-3">
                      {/* IMAGE (placeholder for now) */}
                      <Image
                        src={item?.image}
                        alt={item?.title || "Product image"}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-md"
                      />

                      <div className="flex flex-col text-sm text-gray-500 font-roboto">
                        <span className="font-medium">
                          {item?.title || "Product"}
                        </span>
                        <span>Quantity: {item?.quantity}</span>

                        {/* SELECTED OPTIONS */}
                        {item?.selectedOption &&
                          Object.entries(item.selectedOption).map(
                            ([key, value]: any) => (
                              <span key={key} className="text-gray-500">
                                {key}: {value.join(", ")}
                              </span>
                            )
                          )}
                      </div>
                    </div>

                    {/* PRICE */}
                    <span className="font-semibold text-sm">
                      ${item?.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderPage