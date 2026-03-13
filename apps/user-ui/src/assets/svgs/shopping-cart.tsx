import React from 'react';

const ShoppingCart = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="200px"
      height="200px"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8 2C7.20097 2 6.48245 2.48647 6.1857 3.22834L5.47703 5H3.32297L4.32874 2.48556C4.92922 0.984369 6.38316 0 8 0C9.61684 0 11.0708 0.984368 11.6713 2.48556L12.677 5H10.523L9.81431 3.22834C9.51755 2.48647 8.79903 2 8 2Z"
        fill="currentColor"
      />
      <path d="M15 7H1V9L3 15H13L15 9V7Z" fill="currentColor" />
    </svg>
  );
};
// #030708

export default ShoppingCart;
