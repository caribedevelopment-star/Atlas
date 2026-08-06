import React from 'react';
import { cn } from './utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, helperText, error, id, ...props },
  ref
) {
  const textareaId = id || props.name;
  return (
    <label className="block space-y-1.5" htmlFor={textareaId}>
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={Boolean(error)}
        className={cn('atlas-input min-h-[120px] resize-y', error && 'border-red-500 focus:border-red-400 focus:ring-red-400/20', className)}
        {...props}
      />
      {(error || helperText) && <span className={cn('block text-xs', error ? 'text-red-400' : 'text-muted-foreground')}>{error || helperText}</span>}
    </label>
  );
});
