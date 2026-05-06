/**
 * Componente Button reutilizable con variantes.
 * Soporte: loading state, variants, sizes, disabled.
 */
'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses = {
  primary:
    'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30',
  secondary:
    'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20',
  outline:
    'bg-transparent hover:bg-white/5 text-violet-400 border border-violet-500/30 hover:border-violet-500/50',
  ghost:
    'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white',
  danger:
    'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 hover:border-red-500/40',
};

const sizeClasses = {
  sm: 'min-h-10 px-6 py-2 text-sm rounded-lg',
  md: 'min-h-11 px-8 sm:px-10 py-3 text-sm rounded-xl',
  lg: 'min-h-12 px-10 sm:px-12 py-3.5 sm:py-4 text-base rounded-xl sm:rounded-2xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2 text-center font-medium leading-tight
          transition-all duration-200 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        style={{ paddingLeft: '2rem', paddingRight: '2rem' }}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
