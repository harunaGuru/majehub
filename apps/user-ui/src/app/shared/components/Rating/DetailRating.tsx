'use client';

import { Star } from 'lucide-react';
import React from 'react';

interface RatingProps {
  value: number; // example: 0.5, 3.5, 4
  size?: number;
  className?: string;
}

const ProductRating: React.FC<RatingProps> = ({
  value,
  size = 20,
  className = '',
}) => {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;

    let fillPercentage = 0;

    if (value >= starValue) {
      fillPercentage = 100;
    } else if (value >= starValue - 0.5) {
      fillPercentage = 50;
    }

    return (
      <div
        key={index}
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Empty Star */}
        <Star size={size} className="text-gray-300 absolute top-0 left-0" />

        {/* Filled Portion */}
        <div
          className="absolute top-0 left-0 overflow-hidden"
          style={{ width: `${fillPercentage}%` }}
        >
          <Star size={size} className="text-yellow-400 fill-yellow-400" />
        </div>
      </div>
    );
  });

  return <div className={`flex items-center gap-1 ${className}`}>{stars}</div>;
};

export default ProductRating;
