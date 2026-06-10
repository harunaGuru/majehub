import React from 'react';

interface SidebarMenuProps {
  title?: string;
  children: React.ReactNode;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-4">
      {title && (
        <span className="px-3 text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.3)]">
          {title}
        </span>
      )}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
};

export default SidebarMenu;
