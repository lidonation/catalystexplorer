import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function SecondaryLink({
    className = '',
    children,
    ...props
}: InertiaLinkProps) {
    return (
        <Link
            {...props}
            className={
                `inline-flex items-center rounded-md border border-border border-opacity-50 bg-background px-4 py-2 text-5 font-semibold uppercase tracking-widest text-content-secondary shadow-sm transition duration-150 ease-in-out hover:bg-background-tertiary hover:text-content-secondary focus:outline-none focus:ring-2 focus:border-border-secondary focus:ring-offset-2 disabled:opacity-25` 
                + className
            }
        >
            {children}
        </Link>
    );
}
