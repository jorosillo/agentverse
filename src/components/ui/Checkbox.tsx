/**
 * Componente Checkbox reutilizable.
 * Compatible con React Hook Form via forwardRef.
 */
'use client';

import { forwardRef } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | React.ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              className="peer sr-only"
              {...props}
            />
            <div
              className={`
                h-5 w-5 rounded-md border transition-all duration-200
                peer-checked:bg-violet-600 peer-checked:border-violet-600
                peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500/50
                ${error
                  ? 'border-red-500/50'
                  : 'border-white/20 group-hover:border-white/30'
                }
              `}
            >
              <Check className="h-full w-full p-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
          </div>
          {label && (
            <span className="text-sm text-gray-300 leading-5">{label}</span>
          )}
        </label>
        {error && (
          <p className="text-xs text-red-400 ml-8">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps };
