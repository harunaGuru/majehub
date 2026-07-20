'use client';
import React, { useState } from 'react';
import Sidebar from '@/shared/components/sidebar';
import SellerProtectedLayout from '@/shared/components/layout/SellerProtectedLayout';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex w-full h-full gap-7 bg-black">
      <SellerProtectedLayout>
        <aside
          className={`fixed md:relative top-0 left-0 h-[100dvh] z-50 transition-all duration-300 overflow-hidden ${sidebarOpen ? 'w-[280px]' : 'w-0 md:w-[280px]'
            }`}
        >
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </aside>
        <div className="flex-1 h-full w-full">{children}</div>
      </SellerProtectedLayout>
    </div>
  );
};
export default Layout;
