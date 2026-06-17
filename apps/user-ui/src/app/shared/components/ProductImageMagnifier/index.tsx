'use client';

import ReactImageMagnify from 'easy-magnify-waft';

type Props = {
  image: string;
};

export default function ProductImageMagnifier({
  image,
}: Props) {
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
        // enlargedImageContainerDimensions: {
        //   width: '100%',
        //   height: '100%',
        // },
      }}
    />
  );
}