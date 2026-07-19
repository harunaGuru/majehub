'use client';

import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  stock?: number; // available stock
  min?: number; // minimum allowed quantity
  defaultValue?: number; // initial quantity
  onChange?: (value: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  stock = 100,
  min = 1,
  defaultValue = 1,
  onChange,
}) => {
  const safeInitial = Math.max(min, Math.min(defaultValue, stock));
  const [quantity, setQuantity] = useState<number>(safeInitial);

  const updateQuantity = (value: number) => {
    const clamped = Math.max(min, Math.min(value, stock));
    setQuantity(clamped);
    onChange?.(clamped);
  };

  const handleIncrease = () => {
    if (quantity < stock) {
      updateQuantity(quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > min) {
      updateQuantity(quantity - 1);
    }
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    if (isNaN(value)) return;
    updateQuantity(value);
  };

  return (
    <div className="flex items-center ">
      {/* Decrease */}
      <button
        type="button"
        onClick={handleDecrease}
        disabled={quantity <= min}
        className="w-9 h-9 flex items-center justify-center bg-gray-400 rounded-l-md  disabled:opacity-40"
      >
        <Minus size={16} />
      </button>

      {/* Input */}
      <input
        type="text"
        value={quantity}
        min={min}
        max={stock}
        onChange={handleManualChange}
        className="w-9 border-y border-gray-200 text-center h-9"
      />

      {/* Increase */}
      <button
        type="button"
        onClick={handleIncrease}
        disabled={quantity >= stock}
        className="w-9 h-9 flex items-center justify-center bg-gray-400 rounded-r-md  disabled:opacity-40"
      >
        <Plus size={16} />
      </button>

      {/* Stock Info */}
      <span className="text-sm text-gray-500 ml-2 font-semibold whitespace-nowrap">
        <span className="text-green-600">In Stock</span>{" "}
        (stock {stock})
      </span>
    </div>
  );
};

export default QuantitySelector;
