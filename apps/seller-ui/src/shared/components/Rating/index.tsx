'use client';

import { Star, StarHalf } from 'lucide-react';
import React from 'react';

interface RatingProps {
  value: number; // e.g. 3.5
  size?: number;
  className?: string;
}

const Rating: React.FC<RatingProps> = ({
  value,
  size = 18,
  className = '',
}) => {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starNumber = index + 1;

    if (value >= starNumber) {
      // Full star
      return (
        <Star
          key={index}
          size={size}
          className="fill-yellow-400 text-yellow-400"
        />
      );
    }

    if (value >= starNumber - 0.5) {
      // Half star
      return (
        <StarHalf
          key={index}
          size={size}
          className="fill-yellow-400 text-yellow-400"
        />
      );
    }

    // Empty star
    return <Star key={index} size={size} className="text-gray-300" />;
  });

  return <div className={`flex items-center gap-1 ${className}`}>{stars}</div>;
};

export default Rating;
