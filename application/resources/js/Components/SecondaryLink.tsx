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
                `border-border border-opacity-50 bg-background text-5 text-content-secondary hover:bg-background-tertiary hover:text-content-secondary focus:border-border-secondary inline-flex items-center rounded-md border px-4 py-2 font-semibold tracking-widest uppercase shadow-xs transition duration-150 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:opacity-25` +
                + className
            }
        >
            {children}
        </Link>
    );
}
