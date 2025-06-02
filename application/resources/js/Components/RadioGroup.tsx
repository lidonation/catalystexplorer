import React from 'react';
import ValueLabel from '@/Components/atoms/ValueLabel';

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
}

const RadioGroup: React.FC<RadioGroupProps> = ({
    name,
    options,
    selectedValue,
    onChange,
    direction = 'horizontal',
    labelClassName = 'text-gray-persist ml-2',
    radioClassName = 'h-4 w-4 text-primary focus:ring-primary focus:ring-offset-1 focus:ring-offset-primary focus:ring-1 border-gray-light ',
    groupClassName = '',
    required = false,
}) => {
    return (
        <div
            className={`flex  ${direction === 'horizontal' ? 'space-x-4' : 'flex-col space-y-2'} ${groupClassName}`}
        >
            {options.map((option) => (
                <label key={option.value} className="inline-flex items-center">
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={selectedValue === option.value}
                        onChange={() => onChange(option.value)}
                        disabled={option.disabled}
                        className={radioClassName}
                        required={required}
                    />
                    <ValueLabel className={labelClassName}>
                        {option.label}
                    </ValueLabel>
                </label>
            ))}
        </div>
    );
};

export default RadioGroup;