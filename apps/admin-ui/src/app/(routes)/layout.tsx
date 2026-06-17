"use client"
import Sidebar from '@/shared/components/sidebar';
import React, { useState } from 'react';
import AdminGuard from '../providers/adminGuard';


const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex w-full h-full bg-black min-h-screen">
      <AdminGuard>
        <aside
          className={`fixed md:relative top-0 left-0 h-screen z-50 transition-all duration-300 ${sidebarOpen ? 'w-full md:w-[250px]' : 'w-0 md:w-[250px] overflow-hidden'
            }`}
        >
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </aside>
        <div className="flex-1 pl-6 h-full w-full">{children}</div>
      </AdminGuard>
    </div>
  );
};
export default Layout;
