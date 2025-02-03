import { ButtonHTMLAttributes } from 'react';
import LoadingSpinner from './svgs/LoadingSpinner';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    disabled?: boolean;
    loading?: boolean;
}

export default function PrimaryButton({
    className = '',
    disabled,
    loading = false,
    children,
    ...props
}: PrimaryButtonProps) {
    return (
        <button
            {...props}
            className={`text-4 hover:bg-background-tertiary hover:text-content-secondary focus:bg-background-accent active:bg-background-tertiary active:text-content-secondary from-background-button-gradient-color-1 to-background-button-gradient-color-2 text-content-light inline-flex items-center justify-center rounded-md bg-linear-to-t px-4 py-2 font-semibold tracking-widest uppercase shadow-md transition duration-150 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-hidden ${disabled || loading ? 'cursor-not-allowed opacity-25' : ''} ${className} `}
            disabled={disabled || loading}
        >
            <span
                className={`inline-flex items-center gap-2 ${loading ? 'invisible' : 'visible'}`}
            >
                {children}
            </span>
            {loading && (
                <span className="absolute">
                    <LoadingSpinner />
                </span>
            )}
        </button>
    );
}
