import { Product } from '@/config/types';
import {X} from "lucide-react";
import React from "react";

interface Props {
  product: Product;
  onClose: () => void;
  onDelete: () => void;
  onRestore: () => void;
  isRestorePending?: boolean;
  isDeletePending?: boolean;
}

export const DeleteRestoreModal = ({
  product,
  onClose,
  onDelete,
  onRestore,
    isRestorePending,
    isDeletePending,
}: Props) => {
  const isDeleted = product.isDeleted;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="relative bg-gray-900 text-white p-6 rounded-lg w-96">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-bold mb-4">
          {isDeleted ? 'Restore Product' : 'Delete Product'}
        </h2>

        {!isDeleted ? (
          <p>
            Are you sure you want to delete{' '}
            <span className="font-bold">
              {' '}
              {product?.title ?? 'this Product'}
            </span>{' '}
            ? <br />
            This product will be moved to **delete State** and permanently
            removed after 24hrs. You can restore it before then.
          </p>
        ) : (
          <p>
            Do you want to restore{' '}
            <span className="font-bold">
              {product?.title ?? 'this Product'}
            </span>
            ?
          </p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="bg-gray-500  px-4 py-2 hover:bg-gray-400 transition rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          {isDeleted ? (
            <button
              className="bg-green-500 hover:bg-green-400 transition text-white px-4 py-2 rounded-md"
              onClick={onRestore}
            >
              {isRestorePending ? 'Restoring...' : 'Restore'}
            </button>
          ) : (
            <button
              className="bg-red-500 hover:bg-red-400 transition text-white px-4 py-2 rounded-md"
              onClick={onDelete}
            >
              {isDeletePending ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
