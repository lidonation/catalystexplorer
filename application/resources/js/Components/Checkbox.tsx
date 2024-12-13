import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    value,
    checked,
    onChange,
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-border bg-background text-content-accent shadow-sm ' +
                className
            }
            value={value}
            checked={checked}
            onChange={onChange}
        />
    );
}
