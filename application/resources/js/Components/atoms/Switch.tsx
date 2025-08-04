import * as Switch from '@radix-ui/react-switch';

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label?: string;
    labelShouldPrecede?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    className?: string;
    'data-testid'?: string;
}

const CustomSwitch = ({
    checked,
    onCheckedChange,
    label,
    labelShouldPrecede = false,
    disabled = false,
    size = 'md',
    color = 'bg-primary',
    className = '',
    'data-testid': dataTestId,
}: SwitchProps) => {
    const sizes = {
        sm: {
            switch: 'w-8 h-4',
            thumb: 'w-3 h-3',
            translate: 'translate-x-4',
        },
        md: {
            switch: 'w-10 h-5',
            thumb: 'w-4 h-4',
            translate: 'translate-x-5',
        },
        lg: {
            switch: 'w-12 h-6',
            thumb: 'w-5 h-5',
            translate: 'translate-x-6',
        },
    };

    return (
        <div
            className={`flex w-full items-center justify-between ${
                labelShouldPrecede ? 'flex-row-reverse' : 'flex-row'
            } ${className}`}
        >
            <Switch.Root
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                className={` ${sizes[size].switch} relative rounded-full ${
                    disabled
                        ? 'cursor-not-allowed bg-gray-200'
                        : 'cursor-pointer bg-gray-200'
                } ${checked && !disabled ? color : ''} transition-colors duration-200`}
                data-testid={dataTestId}
            >
                <Switch.Thumb
                    className={` ${sizes[size].thumb} block transform rounded-full bg-white transition-transform duration-200 ${checked ? sizes[size].translate : 'translate-x-0.5'} ${disabled ? 'bg-gray-300' : ''} `}
                />
            </Switch.Root>
            {label && (
                <label
                    className={`t text-sm ${disabled ? 'text-gray-400' : 'text-content'}`}
                >
                    {label}
                </label>
            )}
        </div>
    );
};

export default CustomSwitch;
