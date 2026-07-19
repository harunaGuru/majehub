'use client';

import React, { useState, useEffect } from 'react';
import ReactImageMagnify from 'easy-magnify-waft';
import Image from 'next/image';

type Props = {
  image: string;
};

export default function ProductImageMagnifier({
  image,
}: Props) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="relative w-full h-full aspect-square overflow-hidden rounded-sm bg-white">
        <Image
          src={image}
          alt="Product Image"
          fill
          sizes="(max-width: 768px) 100vw, 450px"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <ReactImageMagnify
      {...{
        smallImage: {
          alt: 'Product Image',
          isFluidWidth: true,
          src: image,
        },
        largeImage: {
          src: `${image}?tr=w-2000`,
          width: 1600,
          height: 1600,
        },
        enlargedImagePosition: 'beside',
        shouldUsePositiveSpaceLens: true,
        lensStyle: {
          backgroundColor: 'rgba(255,255,255,.35)',
        },
      }}
    />
  );
}