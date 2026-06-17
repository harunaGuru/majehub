'use client';
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import useSidebar from '@/hooks/useSidebar';
import {
  DashboardIcon,
  OrderIcon,
  PaymentIcon,
  ProductsIcon,
  AllProductsIcon,
  EventsIcon,
  AllEventsIcon,
  InboxIcon,
  SettingsIcon,
  NotificationsIcon,
  DiscountIcon,
} from '@/assets/icons/sidebar-icons';
import SidebarMenu from '@/shared/components/sidebar/sidebarMenu';
import SidebarItem from '@/shared/components/sidebar/sidebarItem';
import SellerLogoutButton from './SellerLogoutButton';
import { useSeller } from '@/hooks/useSeller';
import { Loader2, Menu, X } from 'lucide-react';
import { getInitials } from '@/utils/getInitials';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const { seller, isLoading: isLoadingSeller } = useSeller();

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);

  const getIconColor = (route: string) => {
    return activeSidebar === route ? '#0085ff' : '#969696';
  };

  const handleSidebarCLick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-6 left-3 z-40 p-2 bg-slate-400 rounded-md border border-slate-700"
      >
        <Menu size={20} />
      </button>
      <aside className="w-full md:w-[280px] h-screen bg-[#0a0a0c] text-white border-r border-[rgba(255,255,255,0.06)] flex flex-col relative">
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 md:hidden"
        >
          <X size={24} />
        </button>
        {/* Header */}
        <div className="p-6 pl-14 lg:pl-6 flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)]">
          <div className="w-9 h-9 bg-gradient-to-br from-[#0085ff] to-[#0066cc] rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-[rgba(0,133,255,0.15)]">
            {getInitials(seller?.name || "")}
          </div>
          <div className="flex flex-col flex-1">
            <span className="font-semibold text-sm text-white">
              {isLoadingSeller ? <Loader2
                size={30}
                className="animate-spin text-blue-500"
              /> : seller?.name}
            </span>
            <span className="text-xs text-[rgba(255,255,255,0.5)]">
              {isLoadingSeller ? <Loader2
                size={30}
                className="animate-spin text-blue-500"
              /> : seller?.email}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-7 custom-scrollbar">
          {/* Dashboard - Standalone */}
          <SidebarMenu>
            <SidebarItem
              title="Dashboard"
              icon={<DashboardIcon fill={getIconColor('/dashboard')} />}
              href="/dashboard"
              isActive={activeSidebar === '/dashboard'}
              onClick={handleSidebarCLick}
            />
          </SidebarMenu>

          {/* Main Menu */}
          <SidebarMenu title="Main Menu">
            <SidebarItem
              title="Orders"
              icon={<OrderIcon fill={getIconColor('/dashboard/orders')} />}
              href="/dashboard/orders"
              isActive={activeSidebar === '/dashboard/orders'}
              onClick={handleSidebarCLick}
            />
            <SidebarItem
              title="Payments"
              icon={<PaymentIcon fill={getIconColor('/dashboard/payments')} />}
              href="/dashboard/payments"
              isActive={activeSidebar === '/dashboard/payments'}
              onClick={handleSidebarCLick}
            />
          </SidebarMenu>
          <SidebarMenu title="Products">
            <SidebarItem
              title="Create Product"
              icon={
                <ProductsIcon fill={getIconColor('/dashboard/create-product')} />
              }
              href="/dashboard/create-product"
              isActive={activeSidebar === '/dashboard/create-product'}
              onClick={handleSidebarCLick}
            />
            <SidebarItem
              title="All Products"
              icon={
                <AllProductsIcon fill={getIconColor('/dashboard/all-products')} />
              }
              href="/dashboard/all-products"
              isActive={activeSidebar === '/dashboard/all-products'}
              onClick={handleSidebarCLick}
            />
          </SidebarMenu>
          {/*Events*/}
          <SidebarMenu title="Events">
            <SidebarItem
              title="Create Event"
              icon={<EventsIcon fill={getIconColor('/dashboard/create-event')} />}
              href="/dashboard/create-event"
              isActive={activeSidebar === '/dashboard/create-event'}
              onClick={handleSidebarCLick}
            />
            <SidebarItem
              title="All Events"
              icon={
                <AllEventsIcon fill={getIconColor('/dashboard/all-events')} />
              }
              href="/dashboard/all-events"
              isActive={activeSidebar === '/dashboard/all-events'}
              onClick={handleSidebarCLick}
            />
          </SidebarMenu>
          {/* Controllers */}
          <SidebarMenu title="Controllers">
            <SidebarItem
              title="Inbox"
              icon={<InboxIcon fill={getIconColor('/dashboard/inbox')} />}
              href="/dashboard/inbox"
              isActive={activeSidebar === '/dashboard/inbox'}
              onClick={handleSidebarCLick}
            />
            <SidebarItem
              title="Settings"
              icon={<SettingsIcon fill={getIconColor('/dashboard/settings')} />}
              href="/dashboard/settings"
              isActive={activeSidebar === '/dashboard/settings'}
              onClick={handleSidebarCLick}
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
              onClick={handleSidebarCLick}
            />
          </SidebarMenu>

          {/* Extra */}
          <SidebarMenu title="Extra">
            <SidebarItem
              title="Discount Codes"
              icon={
                <DiscountIcon fill={getIconColor('/dashboard/discount-codes')} />
              }
              href="/dashboard/discount-codes"
              isActive={activeSidebar === '/dashboard/discount-codes'}
              onClick={handleSidebarCLick}
            />
            <SellerLogoutButton />
          </SidebarMenu>
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
    </>
  );
};

export default Sidebar;
