import { ButtonHTMLAttributes } from 'react';
import LoadingSpinner from "@/Components/svgs/LoadingSpinner";

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
            className={`text-4 hover:bg-background-tertiary hover:text-content-secondary focus:bg-background-accent active:bg-background-tertiary bg-primary active:text-content-secondary text-content-light inline-flex items-center justify-center rounded-md px-2 py-1.5 font-semibold tracking-widest uppercase transition duration-150 ease-in-out focus:ring-0 focus:ring-offset-0 focus:outline-hidden ${disabled || loading ? 'cursor-not-allowed opacity-25' : 'cursor-pointer'} ${className} `}
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
