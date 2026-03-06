import React, { useId } from 'react';
import { getInputClasses, classNames, cn } from '@/utils';
import { AlertCircle } from 'lucide-react';

/**
 * Accessible text input with optional label, error message, and leading icon.
 * @param {Object} props
 * @param {string} [props.type='text'] - HTML input type
 * @param {string} [props.value] - Controlled value
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.label] - Visible label rendered above the input
 * @param {string} [props.error] - Error message shown below the input
 * @param {boolean} [props.disabled=false] - Whether the input is disabled
 * @param {React.ElementType} [props.icon] - Optional Lucide icon component rendered on the left
 * @param {string} [props.className=''] - Additional Tailwind classes for the input element
 * @param {string} [props.id] - Explicit `id`; a generated one is used when omitted
 * @returns {JSX.Element}
 */
const Input = React.memo(
  ({
    type = 'text',
    value,
    onChange,
    placeholder,
    label,
    error,
    disabled = false,
    icon: Icon,
    className = '',
    id: providedId,
    ...props
  }) => {
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const errorId = `${inputId}-error`;
    const state = error ? 'error' : 'normal';

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className={classNames.text.label}>
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            >
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            id={inputId}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            className={getInputClasses(
              state,
              cn(
                Icon && 'pl-10',
                disabled && 'opacity-50 cursor-not-allowed',
                className
              )
            )}
            {...props}
          />
        </div>
        {error && (
          <div
            id={errorId}
            className="flex items-center gap-2 text-error text-xs"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
