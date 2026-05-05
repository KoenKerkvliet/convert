import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900',
          'placeholder:text-slate-400',
          'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30',
          'disabled:bg-slate-50 disabled:text-slate-400',
          className,
        )}
        {...rest}
      />
    );
  },
);
