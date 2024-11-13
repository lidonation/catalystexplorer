import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-background-lighter px-4 py-2 text-xs font-semibold uppercase tracking-widest text-content transition duration-150 ease-in-out hover:bg-background-tertiary hover:text-content-secondary focus:outline-none focus:ring-2 focus:bg-background-accent focus:ring-offset-2 active:bg-background-tertiary active:text-content-secondary  ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
