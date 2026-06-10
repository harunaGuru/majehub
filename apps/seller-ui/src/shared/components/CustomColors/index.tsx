import React, { useState } from 'react';
import { useController, Control } from 'react-hook-form';
import { Plus } from 'lucide-react';

type CustomColorsProps = {
  name: string;
  control: Control<any>;
};

const defaultColors = [
  '#ffffff', // white
  '#ff0000', // red
  '#00ff00', // green
  '#0000ff', // blue
  '#ffff00', // yellow
  '#800080', // purple
  '#ffa500', // orange
];

const isLightColor = (hex: string) => {
  const color = hex.replace('#', '');

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  return luminance > 186;
};

export const CustomColors = ({
  name,
  control
}: CustomColorsProps) => {
  const [availableColors, setAvailableColors] =
    useState<string[]>(defaultColors);

  const {
    field: { value = [], onChange },
  } = useController({
    name,
    control,
    defaultValue: [],
  });


  const toggleColor = (color: string) => {
    let updated;

    if (value.includes(color)) {
      updated = value.filter((c: string) => c !== color);
    } else {
      updated = [...value, color];
    }

    onChange(updated);
    console.log('updated', updated);
  };

  const handleAddCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;

    if (!availableColors.includes(newColor)) {
      setAvailableColors((prev) => [...prev, newColor]);
    }

    if (!value.includes(newColor)) {
      onChange([...value, newColor]);
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-semibold !text-gray-300">
        Colors
      </label>
      <div className="flex flex-wrap gap-2 items-center">
        {availableColors.map((color) => {
          const isSelected = value.includes(color);
          const light = isLightColor(color);
          return (
            <button
              type="button"
              key={color}
              onClick={() => toggleColor(color)}
              className={`w-6 h-6 rounded-md border-2 transition-all duration-200 ${isSelected
                ? ` scale-90 ${light
                  ? 'border-gray-500 ring-2 ring-gray-500'
                  : 'border-white ring-2 ring-white'
                }  `
                : 'border-gray-500 hover:scale-110'
                }
               `}
              style={{ backgroundColor: color }}
            />
          );
        })}

        {/* Hidden Color Input */}

        <div className="relative w-6 h-6">
          <input
            type="color"
            id={`${name}-color-picker`}
            onChange={handleAddCustomColor}
            className="absolute inset-0  w-full h-full opacity-0 cursor-pointer "
          />

          <div className="w-6 h-6 rounded-full bg-gray-700  flex items-center justify-center  pointer-events-none ">
            <Plus size={14} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
