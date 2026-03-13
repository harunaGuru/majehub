import * as React from 'react';
import { Controller, Control } from 'react-hook-form';
import {countryOptions}  from '@/config/countries';

type CountrySelectProps = {
  label?: string;
  name: string;
  control: Control<any>;
  error?: string;
};

export function CountrySelect({ label, name, control, error, }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  const options = React.useMemo(() => countryOptions, []);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-semibold text-gray-900">
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        rules={{ required: 'Country is required' }}
        render={({ field }) => {
          const selected = options.find(o => o.label === field.value);

          return (
            <div className="relative">
              {/* Select button */}
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {selected ? (
                  <div className="flex items-center gap-2">
                    <span className={selected.flagClass} />
                    <span>{selected.label}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="fi fi-as fis"></span>
                    <span className="text-gray-400">Select country</span>
                  </div>
                )}

                <span className="text-gray-400">▾</span>
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white shadow">
                  {options.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        field.onChange(option.label);
                        setOpen(false); // 👈 close after selection
                      }}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <span className={option.flagClass} />
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }}
      />

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}