'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import useSidebar from '@/hooks/useSidebar';
import {
  SidebarWrapper,
  SidebarHeader,
  Logo,
  AdminInfo,
  AdminName,
  AdminEmail,
  SidebarBody,
  SidebarMenu,
  MenuTitle,
  MenuItemsContainer,
  SidebarItemLink,
} from './sidebar.style';

interface SidebarItemProps {
  title: string;
  icon: React.ReactNode;
  href: string;
}

interface IconProps {
  fill?: string;
  style?: React.CSSProperties;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ title, icon, href }) => {
  const { activeSidebar } = useSidebar();
  const router = useRouter();
  const isActive = activeSidebar === href;

  const getIconColor = (route: string) => {
    return activeSidebar === route ? '#0085ff' : '#969696';
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  // Type-safe icon cloning
  const renderIcon = () => {
    if (React.isValidElement<IconProps>(icon)) {
      return React.cloneElement(icon, {
        fill: getIconColor(href),
        style: { transition: 'fill 0.2s ease' },
      });
    }
    return icon;
  };

  return (
    <SidebarItemLink
      href={href}
      $isActive={isActive}
      onClick={handleClick}
      scroll={false}
    >
      {renderIcon()}
      <span>{title}</span>
    </SidebarItemLink>
  );
};

const Sidebar: React.FC = () => {
  return (
    <SidebarWrapper>
      <SidebarHeader>
        <Logo>DA</Logo>
        <AdminInfo>
          <AdminName>John Anderson</AdminName>
          <AdminEmail>john.a@company.com</AdminEmail>
        </AdminInfo>
      </SidebarHeader>

      <SidebarBody>
        {/* Dashboard - Standalone */}
        <SidebarMenu>
          <MenuItemsContainer>
            <SidebarItem
              title="Dashboard"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              }
              href="/dashboard"
            />
          </MenuItemsContainer>
        </SidebarMenu>

        {/* Main Menu */}
        <SidebarMenu>
          <MenuTitle>Main Menu</MenuTitle>
          <MenuItemsContainer>
            <SidebarItem
              title="Order"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z" />
                </svg>
              }
              href="/dashboard/order"
            />
            <SidebarItem
              title="Payment"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                </svg>
              }
              href="/dashboard/payment"
            />
            <SidebarItem
              title="Products"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              }
              href="/dashboard/create-product"
            />
            <SidebarItem
              title="All Products"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
                </svg>
              }
              href="/dashboard/all-products"
            />
          </MenuItemsContainer>
        </SidebarMenu>

        {/* Controllers */}
        <SidebarMenu>
          <MenuTitle>Controllers</MenuTitle>
          <MenuItemsContainer>
            <SidebarItem
              title="Events"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM7 12h5v5H7v-5z" />
                </svg>
              }
              href="/dashboard/create-event"
            />
            <SidebarItem
              title="All Events"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
                </svg>
              }
              href="/dashboard/all-events"
            />
            <SidebarItem
              title="Inbox"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-3h4.5c.33 1.13 1.39 2 2.63 2s2.3-.87 2.63-2H20v3zm0-5h-5.5c-.33 1.13-1.39 2-2.63 2s-2.3-.87-2.63-2H4V6h16v7z" />
                </svg>
              }
              href="/dashboard/inbox"
            />
          </MenuItemsContainer>
        </SidebarMenu>

        {/* Extra */}
        <SidebarMenu>
          <MenuTitle>Extra</MenuTitle>
          <MenuItemsContainer>
            <SidebarItem
              title="Settings"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94 0 .31.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                </svg>
              }
              href="/dashboard/settings"
            />
            <SidebarItem
              title="Notifications"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
              }
              href="/dashboard/notifications"
            />
            <SidebarItem
              title="Discount Codes"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm3 10h-6v-2c0-1.33 2-3 3-3s3 1.67 3 3v2z" />
                </svg>
              }
              href="/dashboard/discount-codes"
            />
            <SidebarItem
              title="Logout"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
              }
              href="/logout"
            />
          </MenuItemsContainer>
        </SidebarMenu>
      </SidebarBody>
    </SidebarWrapper>
  );
};

export default Sidebar;
