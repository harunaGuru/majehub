'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

interface Props {
  src: string;
  zoomSrc?: string;
  alt?: string;
}

export default function ProductImageZoom({ src, zoomSrc, alt }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState(false);
  const [cursor, setCursor] = useState({ x: 50, y: 50 });

  // Track cursor inside the container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursor({ x, y });
  };

  return (
    <div className="flex gap-6 relative">
      {/* Main Image */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square bg-white cursor-crosshair"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={src}
          alt={alt || 'product'}
          fill
          sizes="500px"
          className="object-cover"
          priority
        />
      </div>

      {/* Zoom Panel (desktop only) */}
      {hover && (
        <div className="hidden lg:block w-[500px] h-[500px] border bg-white overflow-hidden">
          <div
            className="w-full h-full bg-no-repeat"
            style={{
              backgroundImage: `url(${zoomSrc || src})`,
              backgroundSize: '200%',
              backgroundPosition: `${cursor.x}% ${cursor.y}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
