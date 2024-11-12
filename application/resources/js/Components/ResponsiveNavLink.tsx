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
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-border-primary bg-background-secondary text-content-accent focus:border-border-secondary focus:bg-background-secondary focus:text-content-accent'
                    : 'border-transparent text-content-tertiary hover:border-border-secondary hover:bg-border-primary hover:text-content-primary focus:border-border-secondary focus:bg-background-secondary focus:text-content-primary over:border-gray-600'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
