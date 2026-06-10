import React, { useRef, useState } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '@/utils/axiosInstance';
import { fileToBase64 } from '@/utils/convertToBase64';

interface ImagePlaceholderProps {
  slotId: number;
  image?: string;
  isMain?: boolean;
  isFilled: boolean;
  onImageSelect: (slotId: number, file: File, preview: string) => void;
  onReplaceImage: (slotId: number, file: File, preview: string) => void;
  onDeleteImage: (slotId: number) => void;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>
}

const uploadImage = async (base64: string, fileName: string) => {
  const { data } = await axiosInstance.post('/product/api/upload-image', {
    file: base64,
    fileName,
    folder: '/products',
  });

  return data; // { url, fileId }
};

const deleteImage = async (fileId: string) => {
  const response = await axiosInstance.delete(`/product/api/delete-image/${fileId}`);
  return response.data;
}
const ImagePlaceHolder = ({
  slotId,
  image,
  isMain = false,
  isFilled,
  onImageSelect,
  onReplaceImage,
  onDeleteImage,
  setValue,
  getValues,
}: ImagePlaceholderProps) => {
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [isTransformed, setIsTransformed] = useState(false);
  const [imageKitData, setImageKitData] = useState<{
    fileUrl: string;
    fileId: string;
  } | null>(null);
  const [transformedImage, setTransformedImage] = useState(image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [isApplyingEffect, setIsApplyingEffect] = useState(false);

  const transformationEffects = [
    {
      label: 'Remove BG',
      value: 'e-removedotbg',
    },

    // Soft ecommerce shadow (recommended default)
    {
      label: 'Soft Product Shadow',
      value: 'e-dropshadow,dx-0,dy-18,blur-35,opacity-35,color-000000',
    },

    // Premium studio shadow (slightly stronger)
    {
      label: 'Studio Shadow',
      value: 'e-dropshadow,dx-0,dy-28,blur-55,opacity-45,color-000000',
    },

    // AI retouch (safe standalone)
    {
      label: 'Retouch',
      value: 'e-retouch',
    },

    // AI upscale (safe standalone)
    {
      label: 'Upscale',
      value: 'e-upscale',
    },
  ];

  const uploadMutation = useMutation({
    mutationFn: ({
      base64,
      fileName,
      slotId,
    }: {
      base64: string;
      fileName: string;
      slotId: number;
    }) => uploadImage(base64, fileName),

    onSuccess: (data, variables) => {
      const { slotId } = variables;
      const imageObject = {
        fileUrl: data.url,
        fileId: data.fileId,
      };
      setValue(`images.${slotId}`, imageObject);

      setImageKitData(imageObject);

      // ensure modal uses CDN url not blob
      setTransformedImage(data.url);
      // setValue(`images.${slotId}`, {
      //   fileUrl: data.url,
      //   fileId: data.fileId,
      // });
    },
  });

  // const applyTransformation = (originalUrl: string, transformation: string) => {
  //   // if(!originalUrl || !transformation) return;
  //   // setProcessing(true);
  //   const hasParams = originalUrl.includes('?');
  //
  //   // Append or add tr=
  //   return hasParams
  //     ? `${originalUrl}:tr=${transformation}`
  //     : `${originalUrl}?tr=${transformation}`;
  // };

  const applyTransformation = async (transformation: string) => {
    setIsTransformed(false);
    try {
      if (!imageKitData?.fileUrl) {
        throw new Error('No ImageKit URL available');
      }
      setActiveEffect(transformation);

      // Remove previous transformation
      const baseUrl = imageKitData.fileUrl.split('?tr=')[0];

      const transformedUrl = `${baseUrl}?tr=${transformation}`;

      // Optional validation check
      const response = await fetch(transformedUrl, { method: 'HEAD' });

      if (!response.ok) {
        throw new Error('ImageKit transformation failed');
      }

      setTransformedImage(transformedUrl);
      console.log('transformedUrl', transformedUrl)
      setIsTransformed(true);
    } catch (error) {
      console.error(error);
      setActiveEffect(null);
      setIsTransformed(false);
    } finally {
      console.log('done')
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => deleteImage(fileId),
    onSuccess: () => {
      console.log('imagePlaceHolder deleted successfully.');
    },
    onError: (error: Error) => {
      console.log('Could not delete Image placeHolder', error);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const currentImage = getValues(`images.${slotId}`);
      const currentFileId = currentImage?.fileId;
      if (currentFileId) {
        await deleteMutation.mutateAsync(currentFileId);
        console.log('Old image deleted.');
      }
      if (file) {
        const preview = URL.createObjectURL(file);
        if (isFilled) {
          onReplaceImage(slotId, file, preview);
        } else {
          onImageSelect(slotId, file, preview);
        }
        const base64 = await fileToBase64(file);
        uploadMutation.mutate({
          base64,
          fileName: file.name, //`product-${Date,now()}.jpg',
          slotId,
        });
      }
    } catch (error) {
      console.error(error);
    }

    e.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const sizeClass = isMain ? 'w-80 h-80' : 'w-40 h-40';
  const currentImage = getValues(`images.${slotId}`);

  return (
    <>
      <div
        className={`relative ${sizeClass} border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center`}
      >
        {currentImage ? (
          // Filled placeholder
          <>
            <img
              src={currentImage.fileUrl || image}
              alt={`Upload ${slotId}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={triggerFileInput}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                title="Replace image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              {/* Transform */}
              <button
                type="button"
                onClick={() => {
                  const imageData = getValues(`images.${slotId}`);
                  if (imageData?.fileUrl) {
                    setImageKitData(imageData);
                    setTransformedImage(imageData.fileUrl);
                    setShowModal(true);
                  }
                }}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                title="Transform image"
              >
                {/* magic wand icon */}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setDeleteModal(true)}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                title="Delete image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        ) : (
          // Empty placeholder
          <>
            <span className="text-gray-500 text-sm">Add an image</span>
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              title="Upload image"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}
      </div>
      {/*Transformation Modal*/}
      {showModal && image && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start pt-20 z-50">
          <div className="bg-white w-[80%] max-w-5xl rounded-xl shadow-xl flex p-6 gap-6">
            {/* LEFT SECTION - IMAGE */}
            <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
              <img
                src={transformedImage || imageKitData?.fileUrl}
                alt="Selected"
                className="max-h-[500px] object-contain"
              />
            </div>

            {/* RIGHT SECTION - CONTROLS */}
            <div className="w-[300px] flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Image Transform</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Enhance your product image using AI transformations.
                </p>

                <div className="flex flex-col gap-3">
                  {transformationEffects.map((effect) => (
                    <button
                      key={effect.value}
                      disabled={activeEffect !== null}
                      onClick={() => applyTransformation(effect.value)}
                      className={`py-2 rounded text-white ${activeEffect === effect.value
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-800'
                        }`}
                    >
                      {activeEffect === effect.value
                        ? isTransformed ? 'Applied' : 'Applying...'
                        : effect.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (transformedImage) {
                      setValue(`images.${slotId}.fileUrl`, transformedImage);
                    }
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-black text-white rounded"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Image</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this image?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteImage(slotId);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePlaceHolder;
