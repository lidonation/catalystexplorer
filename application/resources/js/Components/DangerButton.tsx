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
                `inline-flex items-center rounded-md border border-transparent bg-background-error-primary px-4 py-2 text-5 font-semibold uppercase tracking-widest text-content transition duration-150 ease-in-out hover:bg-background-error-secondary focus:outline-hidden focus:ring-2 focus:border-border-secondary ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
