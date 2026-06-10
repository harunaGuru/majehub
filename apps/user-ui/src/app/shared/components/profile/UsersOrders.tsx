import React from 'react'
import { ArrowUpRight } from "lucide-react";
import { useRouter } from 'next/navigation';

type Order = {
  orderId: string;
  total: number;
  status: string;
  date: string;
}

const UsersOrders = ({
  orders,
  isLoading,
}: {
  orders: Order[];
  isLoading: boolean;
}) => {
  const router = useRouter()
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const truncateId = (id: string) => {
    return id.slice(0, 6);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Orders</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-gray-600 border-b border-b-gray-300">
                <th className="py-1 px-2 text-left font-medium">Order ID</th>
                <th className="py-1 px-2 text-left font-medium">Total($)</th>
                <th className="py-1 px-2 text-left font-medium">Status</th>
                <th className="py-1 px-2 text-left font-medium">Date</th>
                <th className="py-1 px-2 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>

              {isLoading && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              )}

              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    No orders yet
                  </td>
                </tr>
              )}

              {!isLoading &&
                orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className='border-b border-b-gray-300'
                  >
                    <td className="py-1 px-2 font-medium text-gray-900">
                      {truncateId(order.orderId)}
                    </td>

                    <td className="py-1 px-2 text-gray-600">
                      ${order.total.toLocaleString()}
                    </td>

                    <td className="py-1 px-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-1 px-2 text-gray-500">
                      {formatDate(order.date)}
                    </td>

                    <td className="py-1 px-2">
                      <button onClick={() => router.push(`/order/${order.orderId}`)} className="p-2 rounded-md flex items-center gap-2 text-blue-600 hover:bg-blue-100 transition">
                        <span>Track Order</span>
                        <ArrowUpRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersOrders