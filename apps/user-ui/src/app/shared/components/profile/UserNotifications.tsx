import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '@/utils/axiosInstance';
import Link from 'next/link';

const UserNotifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['userNotifications'],
    queryFn: async () => {
      const response = await axiosInstance.get('/user/api/get-user-notifications');
      return response.data.notifications;
    }
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await axiosInstance.post('/seller/api/mark-notification-as-read', {
        notificationId,
      });
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Notifications</h2>
      {isLoading ? (
        <p className="text-center py-4 text-gray-600">Loading notifications...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-600">No notifications</p>
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
  )
}

export default UserNotifications