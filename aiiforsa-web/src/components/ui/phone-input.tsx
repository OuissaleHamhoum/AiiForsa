'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import PhoneNumberInput, { parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PhoneInputProps {
    value?: string;
    onChange?: (value: string | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ value, onChange, placeholder, disabled, className }, ref) => {
        const normalizedValue = value
            ? parsePhoneNumber(value)?.number
            : undefined;
        return (
            <PhoneNumberInput
                inputRef={ref}
                international
                countryCallingCodeEditable={false}
                defaultCountry="TN"
                value={normalizedValue}
                onChange={val => onChange?.(val)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    'PhoneInput flex items-center rounded-md border border-border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                    className,
                )}
            />
        );
    },
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
