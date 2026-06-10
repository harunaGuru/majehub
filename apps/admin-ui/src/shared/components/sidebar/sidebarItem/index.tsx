'use client';

import React from 'react';
import Link from 'next/link';

interface SidebarItemProps {
  title: string;
  icon: React.ReactNode;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  title,
  icon,
  href,
  isActive = false,
  onClick,
}) => {
  return (
    <Link
      href={href || '#'}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        text-sm font-medium transition-all duration-200
        relative overflow-hidden w-full
        ${isActive
          ? 'bg-[rgba(0,133,255,0.08)] text-[#0085ff] font-semibold'
          : 'text-[#969696] hover:bg-[rgba(255,255,255,0.04)] hover:text-white'
        }
        active:scale-[0.96] active:bg-[rgba(0,133,255,0.15)]
      `}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#0085ff] rounded-r-md shadow-[0_0_8px_rgba(0,133,255,0.4)]" />
      )}
      <span className="flex items-center justify-center">{icon}</span>
      <span>{title}</span>
    </Link>
  );
};

export default SidebarItem;
