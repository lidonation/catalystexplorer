import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 ps-3 pe-4 ${
                active
                    ? 'border-border bg-background-lighter text-content-accent focus:border-border-secondary focus:bg-background-lighter focus:text-content-accent'
                    : 'text-dark hover:border-border-secondary hover:bg-border-primary hover:text-content focus:border-border-secondary focus:bg-background-lighter focus:text-content over:border-gray-600 border-transparent'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-hidden ${className}`}
        >
            {children}
        </Link>
    );
}
