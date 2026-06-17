"use client"
import Link from 'next/link'
import React from 'react'
import { ChevronRight } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '@/utils/axiosInstance';

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/api/get-admin-notifications');
      console.log("admin notifications", response.data);
      return response.data.notifications;
    }
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await axiosInstance.post('/seller/api/mark-notification-as-read', {
        notificationId,
      });
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col p-4 mb-8">
      <h1 className="font-poppins text-white font-semibold text-lg tracking-wide pl-4 lg:pl-0">
        Notifications
      </h1>
      <div className="flex items-center text-white mb-6 pl-4 lg:pl-0">
        <Link href="/dashboard" className="text-blue-500 opacity-80">
          Dashboard
        </Link>
        <span className="opacity-80">
          <ChevronRight size={20} />
        </span>
        <span>Notifications</span>
      </div>
      {isLoading ? (
        <p className="text-center py-4 text-gray-600">Loading notifications...</p>
      ) : data?.length === 0 ? (
        <p className="text-center py-4 text-gray-600">No notifications</p>
      ) : (
        <div className="space-y-4 mt-4">
          {data?.map((notification: any) => (
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
  )
}

export default NotificationsPage