import Sidebar from '@/shared/components/sidebar';
import React from 'react';
import AdminGuard from '../providers/adminGuard';


const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AdminGuard>
      <div className="flex w-full h-full bg-black min-h-screen">
        <aside className="w-[250px] min-w-[200px] max-w-[300px] border-r border-slate-600 p-4">
          <Sidebar />
        </aside>
        <div className="flex-1 pl-6 h-full">{children}</div>
      </div>
    </AdminGuard>
  );
};
export default Layout;
