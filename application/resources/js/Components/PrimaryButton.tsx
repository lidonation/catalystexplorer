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
            className={`text-4 hover:bg-background-tertiary hover:text-content-secondary focus:bg-background-accent active:bg-background-tertiary active:text-content-secondary inline-flex items-center justify-center rounded-md bg-linear-to-t from-background-button-gradient-color-1 to-background-button-gradient-color-2 px-4 py-2 font-semibold uppercase tracking-widest text-content-light shadow-md transition duration-150 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-offset-2 ${disabled || loading ? 'cursor-not-allowed opacity-25' : ''} ${className} `}
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
