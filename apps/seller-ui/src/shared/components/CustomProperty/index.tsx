import React, { useState } from 'react';
import {
  Control,
  UseFormSetValue,
  useFieldArray,
  useWatch,
} from 'react-hook-form';

type Props = {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
};

export function CustomProperties({ control, setValue }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customProperties' as any, // keep same form key
  });

  // ✅ THIS fixes value rendering
  const watchedSpecs = useWatch({
    control,
    name: 'customProperties',
  });

  const [propertyInput, setPropertyInput] = useState('');
  const [valueInputs, setValueInputs] = useState<Record<number, string>>({});

  const handleAddProperty = () => {
    if (!propertyInput.trim()) return;

    append({
      name: propertyInput.trim(),
      values: [],
    } as any);

    setPropertyInput('');
  };

  const handleAddValue = (index: number) => {
    const value = valueInputs[index];
    if (!value?.trim()) return;

    const currentValues = watchedSpecs?.[index]?.values || [];

    setValue(
      `customProperties.${index}.values`,
      [...currentValues, value.trim()],
      { shouldDirty: true }
    );

    setValueInputs((prev) => ({
      ...prev,
      [index]: '',
    }));
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-white">Custom Properties</h2>

      {fields.map((field: any, index: number) => (
        <div
          key={field.id}
          className="relative border border-gray-700 bg-gray-900 rounded-lg p-4 space-y-4"
        >
          {/* ✅ Close (X) Button */}
          <button
            type="button"
            onClick={() => remove(index)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg font-bold"
          >
            ×
          </button>
          {/* Property Name */}
          <h3 className="text-lg font-semibold text-white">{field.name}</h3>

          {/* ✅ Render values from watchedSpecs */}
          <div className="flex flex-wrap gap-2">
            {watchedSpecs?.[index]?.values?.map((value: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
              >
                {value}
              </span>
            ))}
          </div>

          {/* Add Value */}
          <div className="flex gap-2">
            <input
              type="text"
              value={valueInputs[index] || ''}
              onChange={(e) =>
                setValueInputs((prev) => ({
                  ...prev,
                  [index]: e.target.value,
                }))
              }
              placeholder={`Add ${field.name} value`}
              className="flex-1 bg-black border border-gray-700 text-white px-3 py-2 rounded-md"
            />

            <button
              type="button"
              onClick={() => handleAddValue(index)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Add
            </button>
          </div>
        </div>
      ))}

      {/* Add Property */}
      <div className="flex gap-2">
        <input
          type="text"
          value={propertyInput}
          onChange={(e) => setPropertyInput(e.target.value)}
          placeholder="Enter property name (e.g. Material)"
          className="flex-1 bg-black border border-gray-700 text-white px-3 py-2 rounded-md"
        />

        <button
          type="button"
          onClick={handleAddProperty}
          className="px-4 py-2 bg-green-600 text-white rounded-md"
        >
          Add
        </button>
      </div>
    </div>
  );
}
