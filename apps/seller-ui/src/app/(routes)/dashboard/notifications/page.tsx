'use client'
import Link from 'next/link'
import React from 'react'
import { ChevronRight } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '@/utils/axiosInstance';

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['sellerNotifications'],
    queryFn: async () => {
      const response = await axiosInstance.get('/seller/api/get-seller-notifications');
      console.log("seller notifications", response.data);
      return response.data.notifications;
    }
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await axiosInstance.post('/seller/api/mark-notification-as-read', {
        notificationId,
      });
      queryClient.invalidateQueries({ queryKey: ['sellerNotifications'] });
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black px-4 py-6 text-white">
      <div className="mt-4">
        <h1 className="font-poppins text-white font-semibold text-lg tracking-wide">
          Notifications
        </h1>

        {/* Breadcrumb */}
        <div className="mt-1 flex items-center text-sm text-zinc-400">
          <Link
            href="/dashboard"
            className="text-blue-500 transition hover:opacity-80"
          >
            Dashboard
          </Link>

          <ChevronRight size={16} className="mx-1" />

          <span>Notifications</span>
        </div>
        {isLoading ? (
          <p className="text-center py-4 text-gray-600">Loading notifications...</p>
        ) : data.length === 0 ? (
          <p className="text-center py-4 text-gray-600">No notifications</p>
        ) : (
          <div className="space-y-4 mt-4">
            {data.map((notification: any) => (
              <Link onClick={() => handleMarkAsRead(notification.id)} href={notification?.redirect_link} key={notification?.id} className={`block border-y border-zinc-800 rounded-md p-2  hover:bg-zinc-900 transition ${notification?.status === "Read" ? "text-gray-600" : "text-gray-400"}`}>
                <div>
                  <strong className="block text-[18px] ">{notification?.title}</strong>
                  <p>{notification?.message}</p>
                  <span className="text-sm">
                    {new Date(notification?.createdAt).toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default NotificationsPage