import ValueLabel from '@/Components/atoms/ValueLabel';
import React, { useCallback } from 'react';

interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface RadioGroupProps {
    name: string;
    options: RadioOption[];
    selectedValue: string;
    onChange: (value: string) => void;
    direction?: 'horizontal' | 'vertical';
    labelClassName?: string;
    radioClassName?: string;
    groupClassName?: string;
    required?: boolean;
    'data-testid'?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
    name,
    options,
    selectedValue,
    onChange,
    direction = 'horizontal',
    labelClassName = 'text-gray-persist ml-2',
    radioClassName = 'transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 cursor-pointer',
    groupClassName = '',
    required = false,
    'data-testid': dataTestId,
}) => {
    const handleChange = useCallback((value: string) => {
        onChange(value);
    }, [onChange, name, selectedValue]);
    
    return (
        <div
            className={`flex ${direction === 'horizontal' ? 'space-x-4' : 'flex-col space-y-2'} ${groupClassName}`}
        >
            {options.map((option, index) => {
                const radioId = `${name}-${option.value}`;
                const isChecked = selectedValue === option.value;
                
                return (
                    <label key={option.value} htmlFor={radioId} className="inline-flex items-center cursor-pointer">
                        <input
                            id={radioId}
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={isChecked}
                            onChange={() => handleChange(option.value)}
                            disabled={option.disabled}
                            className={`${radioClassName} ${isChecked ? 'radio-checked' : 'radio-unchecked'}`}
                            required={required}
                            data-testid={dataTestId ? `${dataTestId}-${index}` : undefined}
                            style={{
                                backgroundColor: isChecked ? 'var(--cx-primary)' : 'var(--cx-background)',
                                borderColor: isChecked ? 'var(--cx-primary)' : 'var(--cx-border-secondary-color)',
                                boxShadow: isChecked ? 'inset 0 0 0 2px var(--cx-background)' : 'none',
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                            }}
                        />
                        <ValueLabel className={labelClassName}>
                            {option.label}
                        </ValueLabel>
                    </label>
                );
            })}
        </div>
    );
};

export default RadioGroup;
