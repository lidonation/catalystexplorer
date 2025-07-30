import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'border-light-gray-persist hover:cursor-pointer checked:border-primary text-primary focus:ring-primary rounded-sm shadow-xs ' +
                className
            }
        />
    );
}
