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
                'border-border text-content-accent focus:ring-primary rounded-sm shadow-xs ' +
                className
            }
        />
    );
}
