'use client';

import React from 'react';

interface SectionTitleProps {
  title: string;
  className?: string;
}

const SectionTitle = ({ title, className }: SectionTitleProps) => {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* SVG UNDER TEXT */}
      <svg
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[180px] h-[70px] pointer-events-none z-0"
        viewBox="0 0 180 70"
        fill="none"
        style={{ transform: 'translateY(-50%) rotateX(180deg)' }}
      >
        <path
          // d="M40 68C40 0 140 0 180 37 183 43 178 68 171 74"
          d="
           M95 65
            C140 60, 170 40, 150 25
            C120 5, 50 5, 0 25
          "
          stroke="#ef4444"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      ;{/* TEXT ABOVE */}
      <h2 className="relative z-10 text-xl sm:text-2xl font-bold text-gray-900">
        {title}
      </h2>
    </div>
  );
};

export default SectionTitle;








