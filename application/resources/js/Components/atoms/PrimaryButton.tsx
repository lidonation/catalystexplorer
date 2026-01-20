import LoadingSpinner from '@/Components/svgs/LoadingSpinner';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    disabled?: boolean;
    loading?: boolean;
}

const PrimaryButton = forwardRef<
    HTMLButtonElement,
    PrimaryButtonProps & { 'data-testid'?: string }
>(
    (
        {
            className = '',
            disabled,
            loading = false,
            children,
            'data-testid': dataTestId,
            ...props
        },
        ref
    ) => {
        return (
            <button
                {...props}
                ref={ref}
                className={`hover:bg-background-tertiary hover:text-content-secondary text-sm font-medium focus:bg-background-accent active:bg-background-tertiary bg-primary active:text-content-secondary text-content-light inline-flex items-center justify-center rounded-md px-2 py-1.5 tracking-widest transition duration-150 ease-in-out focus:ring-0 focus:ring-offset-0 focus:outline-hidden disabled:opacity-50 ${disabled || loading ? 'cursor-not-allowed opacity-25 ' : 'cursor-pointer'} ${className} `}
                disabled={disabled || loading}
                data-testid={dataTestId}
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
);

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
