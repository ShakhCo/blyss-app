import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '~/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
  /** Color variant */
  color?: 'primary' | 'danger' | 'secondary';
  /** Border radius variant */
  border?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  /** Shadow variant */
  shadow?: 'sm' | 'base' | 'lg' | 'xl';
  /** Show loading spinner */
  isLoading?: boolean;
  /** Button variant style */
  variant?: 'solid' | 'outline' | 'ghost';
  /** Full width button */
  fullWidth?: boolean;
  /** Button content */
  children: React.ReactNode;
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  default: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3.5 text-lg',
};

const colorStyles = {
  primary: {
    solid: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
    outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary/10',
    ghost: 'bg-transparent text-primary hover:bg-primary/10',
  },
  danger: {
    solid: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    outline: 'bg-transparent text-red-500 border-2 border-red-500 hover:bg-red-500/10',
    ghost: 'bg-transparent text-red-500 hover:bg-red-500/10',
  },
  secondary: {
    solid: 'bg-stone-100 text-stone-800 hover:bg-stone-200 active:bg-stone-300',
    outline: 'bg-transparent text-stone-800 border-2 border-stone-200/50 hover:bg-stone-100',
    ghost: 'bg-transparent text-stone-800 hover:bg-stone-100',
  },
};

const borderStyles = {
  sm: 'rounded-lg',
  default: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  full: 'rounded-full',
};

const shadowStyles = {
  sm: 'shadow-sm',
  base: 'shadow',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size = 'default',
      color = 'primary',
      border = 'default',
      shadow,
      variant = 'solid',
      isLoading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          colorStyles[color][variant],
          borderStyles[border],
          shadow && shadowStyles[shadow],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 size={size === 'sm' ? 14 : 18} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
