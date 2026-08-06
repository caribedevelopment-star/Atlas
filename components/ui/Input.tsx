import React from 'react';
import { cn } from './utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, helperText, error, id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn('atlas-input', error && 'border-red-500 focus:border-red-400 focus:ring-red-400/20', className)}
        {...props}
      />
      {(error || helperText) && <span className={cn('block text-xs', error ? 'text-red-400' : 'text-muted-foreground')}>{error || helperText}</span>}
    </label>
  );
});
