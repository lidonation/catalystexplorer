import { ButtonHTMLAttributes } from 'react';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `bg-background-error-primary text-5 text-content hover:bg-background-error-secondary focus:border-border-secondary inline-flex items-center rounded-md border border-transparent px-4 py-2 font-semibold tracking-widest uppercase transition duration-150 ease-in-out focus:ring-2 focus:outline-hidden ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
