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
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 text-content-primary transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-gray-200 focus:border-indigo-700 dark:border-indigo-600'
                    : 'border-transparent hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700') +
                className
            }
        >
            {children}
        </Link>
    );
}
