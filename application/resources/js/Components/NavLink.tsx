import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 text-content transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-border focus:border-border-secondary'
                    : 'border-transparent hover:border-border-secondary hover:text-content focus:border-border-secondary focus:text-content-secondary') +
                className
            }
        >
            {children}
        </Link>
    );
}
