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
  LogoutIcon,
} from '@/assets/icons/sidebar-icons';
import SidebarMenu from '@/shared/components/sidebar/sidebarMenu';
import SidebarItem from '@/shared/components/sidebar/sidebarItem';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { activeSidebar, setActiveSidebar } = useSidebar();

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);

  const getIconColor = (route: string) => {
    return activeSidebar === route ? '#0085ff' : '#969696';
  };

  return (
    <aside className="w-[280px] h-screen bg-[#0a0a0c] text-white fixed left-0 top-0 border-r border-[rgba(255,255,255,0.06)] flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="w-12 h-12 bg-gradient-to-br from-[#0085ff] to-[#0066cc] rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-[rgba(0,133,255,0.15)]">
          DA
        </div>
        <div className="flex flex-col flex-1">
          <span className="font-semibold text-sm text-white">
            John Anderson
          </span>
          <span className="text-xs text-[rgba(255,255,255,0.5)]">
            john.a@company.com
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
          />
        </SidebarMenu>

        {/* Main Menu */}
        <SidebarMenu title="Main Menu">
          <SidebarItem
            title="Order"
            icon={<OrderIcon fill={getIconColor('/dashboard/order')} />}
            href="/dashboard/order"
            isActive={activeSidebar === '/dashboard/order'}
          />
          <SidebarItem
            title="Payment"
            icon={<PaymentIcon fill={getIconColor('/dashboard/payment')} />}
            href="/dashboard/payment"
            isActive={activeSidebar === '/dashboard/payment'}
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
          />
          <SidebarItem
            title="All Products"
            icon={
              <AllProductsIcon fill={getIconColor('/dashboard/all-products')} />
            }
            href="/dashboard/all-products"
            isActive={activeSidebar === '/dashboard/all-products'}
          />
        </SidebarMenu>
        {/*Events*/}
        <SidebarMenu title="Events">
          <SidebarItem
            title="Events"
            icon={<EventsIcon fill={getIconColor('/dashboard/create-event')} />}
            href="/dashboard/create-event"
            isActive={activeSidebar === '/dashboard/create-event'}
          />
          <SidebarItem
            title="All Events"
            icon={
              <AllEventsIcon fill={getIconColor('/dashboard/all-events')} />
            }
            href="/dashboard/all-events"
            isActive={activeSidebar === '/dashboard/all-events'}
          />
        </SidebarMenu>
        {/* Controllers */}
        <SidebarMenu title="Controllers">
          <SidebarItem
            title="Inbox"
            icon={<InboxIcon fill={getIconColor('/dashboard/inbox')} />}
            href="/dashboard/inbox"
            isActive={activeSidebar === '/dashboard/inbox'}
          />
          <SidebarItem
            title="Settings"
            icon={<SettingsIcon fill={getIconColor('/dashboard/settings')} />}
            href="/dashboard/settings"
            isActive={activeSidebar === '/dashboard/settings'}
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

        {/* Extra */}
        <SidebarMenu title="Extra">
          <SidebarItem
            title="Discount Codes"
            icon={
              <DiscountIcon fill={getIconColor('/dashboard/discount-codes')} />
            }
            href="/dashboard/discount-codes"
            isActive={activeSidebar === '/dashboard/discount-codes'}
          />
          <SidebarItem
            title="Logout"
            icon={<LogoutIcon fill={getIconColor('/logout')} />}
            href="/logout"
            isActive={activeSidebar === '/logout'}
          />
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
  );
};

export default Sidebar;
