import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue,
} from 'react-hook-form';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] as const;

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  error?: any;
};
export function SizeSelector<T extends FieldValues>({ control, label, error, name}: Props<T>) {
  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-semibold !text-gray-300 ">
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        defaultValue={[] as PathValue<T, typeof name>}
        render={({ field }) => {
          const selectedSizes: string[] = field.value || [];

          const toggleSize = (size: string) => {
            if (selectedSizes.includes(size)) {
              field.onChange(selectedSizes.filter((s) => s !== size));
            } else {
              field.onChange([...selectedSizes, size]);
            }
          };

          return (
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size);

                return (
                  <button
                    type="button"
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-2.5 py-1 rounded-md text-sm font-medium transition 
                      ${
                        isSelected
                          ? 'bg-white text-black'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                  >
                    {size}
                  </button>
                );
              })}
              {error && <p className="text-sm text-red-500">{error.message}</p>}
            </div>
          );
        }}
      />
    </div>
  );
}