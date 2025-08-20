import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeOff, X, Loader2 } from 'lucide-react';

const inputVariants = cva(
  'transition-all duration-200 ease-in-out w-full appearance-none focus:outline-none rounded-md',
  {
    variants: {
      variant: {
        outlined: 'border bg-transparent focus:border-blue-500',
        filled: 'border-transparent bg-gray-100 dark:bg-gray-700 focus:bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        ghost: 'border-transparent bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700',
      },
      inputSize: {
        sm: 'px-2.5 py-1.5 text-sm',
        md: 'px-3 py-2 text-base',
        lg: 'px-4 py-2.5 text-lg',
      },
      hasLeftIcon: {
        true: 'pl-10',
      },
      hasRightIcon: {
        true: 'pr-10',
      },
      invalid: {
        true: 'border-red-500 text-red-600 placeholder-red-400 focus:border-red-500 focus:ring-red-500',
        false: 'border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500',
      }
    },
    defaultVariants: {
      variant: 'outlined',
      inputSize: 'md',
      invalid: false,
    },
  }
);

const labelVariants = cva(
  'block text-sm font-medium mb-1 transition-colors duration-200',
  {
    variants: {
      invalid: {
        true: 'text-red-600',
        false: 'text-gray-700 dark:text-gray-200',
      },
      disabled: {
        true: 'text-gray-400 dark:text-gray-500',
        false: '',
      }
    },
    defaultVariants: {
      invalid: false,
      disabled: false,
    }
  }
);

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  onClear?: () => void;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({
    className,
    variant,
    inputSize,
    label,
    placeholder,
    helperText,
    errorMessage,
    type = 'text',
    disabled = false,
    invalid = false,
    loading = false,
    value,
    onClear,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const hasClearButton = !!onClear && value && value.length > 0;

    const IconWrapper: React.FC<{ children: React.ReactNode; position: 'left' | 'right' }> = ({ children, position }) => (
      <div className={`absolute inset-y-0 ${position === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}>
        {children}
      </div>
    );

    return (
      <div className={`w-full ${disabled ? 'cursor-not-allowed' : ''}`}>
        {label && <label className={labelVariants({ invalid, disabled })}>{label}</label>}
        <div className="relative">
          {loading && (
            <IconWrapper position="left">
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            </IconWrapper>
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            className={inputVariants({
              variant,
              inputSize,
              invalid,
              hasLeftIcon: loading,
              hasRightIcon: isPassword || hasClearButton,
              className
            })}
            placeholder={placeholder}
            disabled={disabled || loading}
            aria-invalid={invalid}
            value={value}
            {...props}
          />
          {(isPassword || hasClearButton) && (
            <IconWrapper position="right">
              {hasClearButton && (
                <button type="button" onClick={onClear} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none" aria-label="Clear input">
                  <X className="h-5 w-5" />
                </button>
              )}
              {isPassword && (
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none ml-2" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              )}
            </IconWrapper>
          )}
        </div>
        {invalid && errorMessage ? (
          <p className="mt-1.5 text-sm text-red-600">{errorMessage}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

export default InputField;
