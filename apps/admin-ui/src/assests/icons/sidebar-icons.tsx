import React from 'react';

interface IconProps {
  fill?: string;
  className?: string;
}

export const DashboardIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

export const OrderIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z" />
  </svg>
);

export const PaymentIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
  </svg>
);

export const ProductsIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

export const AllProductsIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
  </svg>
);

export const EventsIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM7 12h5v5H7v-5z" />
  </svg>
);

export const AllEventsIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
  </svg>
);

export const InboxIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-3h4.5c.33 1.13 1.39 2 2.63 2s2.3-.87 2.63-2H20v3zm0-5h-5.5c-.33 1.13-1.39 2-2.63 2s-2.3-.87-2.63-2H4V6h16v7z" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94 0 .31.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

export const NotificationsIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

export const DiscountIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm3 10h-6v-2c0-1.33 2-3 3-3s3 1.67 3 3v2z" />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.98 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

export const SellersIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M3 9l1-5h16l1 5H3zm0 2h18v9c0 1.1-.9 2-2 2h-4v-6H9v6H5c-1.1 0-2-.9-2-2v-9z" />
  </svg>
);

export const LoggersIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H7v-2h3v2zm7-4H7v-2h10v2zm0-4H7V7h10v2z" />
  </svg>
);

export const ManagementIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7.028 7.028 0 00-1.63-.94l-.36-2.54A.5.5 0 0013.9 2h-3.8a.5.5 0 00-.49.42l-.36 2.54c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 00-.6.22L2.71 8.48a.5.5 0 00.12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.16a.5.5 0 00-.12.64l1.92 3.32c.14.24.43.34.7.22l2.39-.96c.5.4 1.05.72 1.63.94l.36 2.54c.05.24.25.42.49.42h3.8c.24 0 .44-.18.49-.42l.36-2.54c.58-.23 1.12-.54 1.63-.94l2.39.96c.27.12.56.02.7-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8a3.5 3.5 0 010 7.5z" />
  </svg>
);

export const CustomizationIcon: React.FC<IconProps> = ({
  fill = '#969696',
  className,
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M7 22a1 1 0 01-1-1v-6H5a2 2 0 01-2-2V7a2 2 0 012-2h1V3a1 1 0 012 0v2h2V3a1 1 0 012 0v2h2V3a1 1 0 012 0v2h1a2 2 0 012 2v6a2 2 0 01-2 2h-1v6a1 1 0 01-2 0v-6H8v6a1 1 0 01-1 1z" />
  </svg>
);