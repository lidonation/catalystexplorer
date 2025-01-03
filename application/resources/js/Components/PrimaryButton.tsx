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
                `inline-flex items-center rounded-md bg-gradient-to-t from-background-button-gradient-color-1 to-background-button-gradient-color-2 shadow-md px-4 py-2 text-4 font-semibold uppercase tracking-widest text-content-light transition duration-150 ease-in-out hover:bg-background-tertiary hover:text-content-secondary focus:outline-none focus:ring-2 focus:bg-background-accent focus:ring-offset-2 active:bg-background-tertiary active:text-content-secondary  ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
