import LoadingSpinner from '@/Components/svgs/LoadingSpinner';
import { InertiaLinkProps, Link } from '@inertiajs/react';

interface PrimaryLinkProps extends InertiaLinkProps {
    className?: string;
    disabled?: boolean;
    loading?: boolean;
}

export default function PrimaryLink({
    className = '',
    href = '',
    disabled,
    loading = false,
    children,
    ...props
}: PrimaryLinkProps) {
    return (
        <Link
            {...props}
            href={href}
            className={`hover:bg-background-tertiary hover:text-content-secondary focus:bg-background-accent active:bg-background-tertiary bg-primary active:text-content-secondary text-content-light relative inline-flex items-center justify-center rounded-md px-2 py-1.5 tracking-widest transition duration-150 ease-in-out focus:ring-0 focus:ring-offset-0 focus:outline-hidden ${
                disabled || loading
                    ? 'cursor-not-allowed opacity-25'
                    : 'cursor-pointer'
            } ${className}`}
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
        </Link>
    );
}
