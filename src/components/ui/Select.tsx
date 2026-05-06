/**
 * Componente Select reutilizable con estilo de sistema de diseño.
 * Compatible con React Hook Form via forwardRef.
 */
'use client';

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full appearance-none rounded-xl border bg-white/[0.03] px-4 py-3.5 pr-10
              text-sm text-white
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error
                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                : 'border-white/10 hover:border-white/20'
              }
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-[#111118] text-gray-500">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-[#111118] text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps };
