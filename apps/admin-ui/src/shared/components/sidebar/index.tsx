'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import useSidebar from '@/hooks/useSidebar';
import SidebarMenu from './sidebarMenu';
import SidebarItem from './sidebarItem';
import {
  DashboardIcon,
  OrderIcon,
  PaymentIcon,
  AllProductsIcon,
  AllEventsIcon,
  NotificationsIcon,
  LogoutIcon,
  UsersIcon,
  SellersIcon,
  LoggersIcon,
  ManagementIcon,
  CustomizationIcon,
} from '@/assests/icons/sidebar-icons';
import { axiosInstance } from "@/utils/axiosInstance";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { getInitials } from '@/utils/getInitials';

const logout = async () => {
  await axiosInstance.post("/admin/api/logout-admin");
};

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { admin } = useAdmin()

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Logged out");

      // optional: clear cache
      queryClient.clear();

      // redirect
      window.location.href = "/";
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  const getIconColor = (route: string) => {
    return activeSidebar === route ? '#0085ff' : '#969696';
  };

  const LogoutModal = () => {
    if (!isLogoutModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <div className="relative w-full max-w-md bg-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-2">
            Confirm Logout
          </h2>

          <p className="text-sm text-gray-400">
            Are you sure you want to log out of the admin panel?
          </p>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setLogoutModalOpen(false)}
              className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600"
            >
              Cancel
            </button>

            <button
              onClick={() => logoutMutation.mutate()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-[280px] h-screen bg-[#0a0a0c] text-white fixed left-0 top-0 border-r border-[rgba(255,255,255,0.06)] flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="w-9 h-9 bg-gradient-to-br from-[#0085ff] to-[#0066cc] rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-[rgba(0,133,255,0.15)]">
          {getInitials(admin?.name || "")}
        </div>
        <div className="flex flex-col flex-1">
          <span className="font-semibold text-sm text-white">
            {admin?.name || "Admin"}
          </span>
          <span className="text-xs text-[rgba(255,255,255,0.5)]">
            {admin?.email || "admin"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-7 custom-scrollbar">
        {/* Dashboard */}
        <SidebarMenu>
          <SidebarItem
            title="Dashboard"
            icon={<DashboardIcon fill={getIconColor('/dashboard')} />}
            href="/dashboard"
            isActive={activeSidebar === '/dashboard'}
          />
        </SidebarMenu>

        {/* Main Menu */}
        <SidebarMenu title="Main Menu">
          <SidebarItem
            title="Orders"
            icon={<OrderIcon fill={getIconColor('/dashboard/orders')} />}
            href="/dashboard/orders"
            isActive={activeSidebar === '/dashboard/orders'}
          />
          <SidebarItem
            title="Payments"
            icon={<PaymentIcon fill={getIconColor('/dashboard/payments')} />}
            href="/dashboard/payments"
            isActive={activeSidebar === '/dashboard/payments'}
          />
          <SidebarItem
            title="Products"
            icon={
              <AllProductsIcon fill={getIconColor('/dashboard/products')} />
            }
            href="/dashboard/products"
            isActive={activeSidebar === '/dashboard/products'}
          />
          <SidebarItem
            title="Events"
            icon={
              <AllEventsIcon fill={getIconColor('/dashboard/events')} />
            }
            href="/dashboard/events"
            isActive={activeSidebar === '/dashboard/events'}
          />
          <SidebarItem
            title="Users"
            icon={<UsersIcon fill={getIconColor('/dashboard/users')} />}
            href="/dashboard/users"
            isActive={activeSidebar === '/dashboard/users'}
          />
          <SidebarItem
            title="Sellers"
            icon={<SellersIcon fill={getIconColor('/dashboard/sellers')} />}
            href="/dashboard/sellers"
            isActive={activeSidebar === '/dashboard/sellers'}
          />
        </SidebarMenu>
        {/* Controllers */}
        <SidebarMenu title="Controllers">
          <SidebarItem
            title="Loggers"
            icon={<LoggersIcon fill={getIconColor('/dashboard/loggers')} />}
            href="/dashboard/loggers"
            isActive={activeSidebar === '/dashboard/loggers'}
          />
          <SidebarItem
            title="Management"
            icon={<ManagementIcon fill={getIconColor('/dashboard/management')} />}
            href="/dashboard/management"
            isActive={activeSidebar === '/dashboard/management'}
          />
          <SidebarItem
            title="Notifications"
            icon={
              <NotificationsIcon
                fill={getIconColor('/dashboard/notifications')}
              />
            }
            href="/dashboard/notifications"
            isActive={activeSidebar === '/dashboard/notifications'}
          />
        </SidebarMenu>

        {/* Customization */}
        <SidebarMenu title="Customization">
          <SidebarItem
            title="All Customizations"
            icon={
              <CustomizationIcon fill={getIconColor('/dashboard/customizations')} />
            }
            href="/dashboard/customizations"
            isActive={activeSidebar === '/dashboard/customizations'}
          />
        </SidebarMenu>
        <SidebarMenu title="Extra">
          <SidebarItem
            title="Logout"
            icon={<LogoutIcon fill={getIconColor('/logout')} />}
            onClick={() => setLogoutModalOpen(true)}
          // isActive={activeSidebar === '/logout'}
          />
        </SidebarMenu>
        <LogoutModal />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
