import React from 'react';
import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

type CustomSpecificationsProps = {
  control: Control<any>;
  register: UseFormRegister<any>;
  name: string;
};

export const CustomSpecifications = ({
  control,
  register,
  name,
}: CustomSpecificationsProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className='space-y-3'>
      {/* Specification Fields */}
      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            {/* Specification Name */}
            <input
              placeholder="e.g Battery Life, weight"
              {...register(`${name}.${index}.name`)}
              className="flex-1 min-w-0 bg-transparent text-white border border-gray-600  rounded-md px-3 py-2  outline-none focus:border-blue-500 transition "
            />

            {/* Specification Value */}
            <input
              placeholder="e.g 400mAh, 50kg"
              {...register(`${name}.${index}.value`)}
              className="flex-1 min-w-0 bg-transparent text-white border border-gray-600 rounded-md px-3 py-2 outline-none focus:border-blue-500  transition"
            />

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => remove(index)}
              className=" flex-shrink-0 p-2 text-red-500  hover:text-red-400 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      {/* Add Specification Button */}
      <button
        type="button"
        onClick={() => append({ name: '', value: '' })}
        className=" text-blue-600 hover:text-blue-500  text-sm flex items-center gap-2 transition hover:underline"
      >
        <div className="p-0.5 bg-transparent rounded-full border border-blue-600">
        <Plus size={10} />
        </div>
        Add Specification
      </button>
    </div>
  );
};
