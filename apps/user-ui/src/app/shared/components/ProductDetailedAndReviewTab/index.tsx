'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductTabsProps {
  descriptionHTML: string;
  reviews?: React.ReactNode;
}

const COLLAPSED_HEIGHT = 250;

export default function ProductTabs({ descriptionHTML, reviews }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>(
    'description'
  );
  const [expanded, setExpanded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sanitize HTML
  const cleanHTML = useMemo(
    () => DOMPurify.sanitize(descriptionHTML),
    [descriptionHTML]
  );

  // Convert <img> → Next Image
  const parsedContent = useMemo(() => {
    return parse(cleanHTML, {
      replace(domNode: any) {
        if (
          domNode.type === 'tag' &&
          domNode.name === 'img' &&
          domNode.attribs
        ) {
          // const { src, alt } = domNode.attribs;
          const src = domNode.attribs?.src;
          const alt = domNode.attribs?.alt || 'Product image';
          if(!src) return;

          return (
            <div className="relative w-full aspect-[4/3] mt-4 mb-7">
              <Image
                src={src}
                alt={alt || 'Product image'}
                fill
                className="object-contain rounded-md"
                sizes="100vw"
              />
            </div>
          );
        }
        return undefined;
      },
    });
  }, [cleanHTML]);

  // Auto-scroll when expanded
  useEffect(() => {
    if (expanded && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [expanded]);

  return (
    <div className="mt-12">
      {/* 🔹 Tabs */}
      <div className="flex justify-center mb-8">
        <div className="relative flex bg-gray-200 rounded-full p-1">
          {/* Animated Background */}
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-1 bottom-1 w-1/2 rounded-full bg-white shadow"
            style={{
              left: activeTab === 'description' ? '4px' : '50%',
            }}
          />

          <button
            onClick={() => setActiveTab('description')}
            className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition ${
              activeTab === 'description' ? 'text-black' : 'text-gray-600'
            }`}
          >
            Description
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition ${
              activeTab === 'reviews' ? 'text-black' : 'text-gray-600'
            }`}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* 🔹 Tab Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'description' && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <div ref={containerRef} className="relative py-6">
                {/* Animated Collapse Container */}
                <motion.div
                  initial={false}
                  animate={{
                    maxHeight: expanded ? 2000 : COLLAPSED_HEIGHT,
                  }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden relative"
                >
                  <div className="prose max-w-none prose-gray">
                    {parsedContent}
                  </div>
                </motion.div>

                {/* Fade Overlay */}
                {!expanded && (
                  <div className="absolute bottom-12 left-0 w-full h-24 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none" />
                )}

                {/* Toggle Button */}
                <div className="mt-4">
                  <button
                    onClick={() => setExpanded((prev) => !prev)}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    {expanded ? 'Read Less' : 'Read More'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px] flex items-center justify-center text-gray-500"
            >
              {reviews}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
