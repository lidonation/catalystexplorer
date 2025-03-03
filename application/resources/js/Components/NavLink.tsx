import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={
                'text-4 text-content inline-flex items-center border-b-2 px-1 pt-1 leading-5 font-medium transition duration-150 ease-in-out focus:outline-hidden ' +
                (active
                    ? 'border-border focus:border-border-secondary'
                    : 'hover:border-border-secondary hover:text-content focus:border-border-secondary focus:text-content-secondary border-transparent') +
                className
            }
        >
            {children}
        </Link>
    );
}
