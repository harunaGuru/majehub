import React from 'react';
import Sidebar from '@/shared/components/sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full h-full bg-black">
      <aside className="w-[250px] min-w-[200px] max-w-[300px] border-r border-slate-600 p-4">
        <Sidebar />
      </aside>
      <div className="flex-1 pl-6 h-full">{children}</div>
    </div>
  );
};
export default Layout;
