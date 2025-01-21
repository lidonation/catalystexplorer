import { Link, router } from '@inertiajs/react';
import { ReactNode } from 'react';

type NavLinkItemProps = {
    active?: boolean;
    prefetch?: boolean;
    async?: boolean;
    href: string;
    title: string;
    children: ReactNode;
    className?: string;
    ariaLabel?: string;
};

// These routes should render the full 404 page
const FULL_PAGE_404_ROUTES = [
    '/my/bookmarks',
    '/my/votes',
    '/knowledge-base',
    '/support'
];

export default function NavLinkItem({
    children,
    href,
    title,
    className,
    active = false,
    prefetch = false,
    async = false,
    ariaLabel,
    ...rest
}: NavLinkItemProps) {
    const handleClick = (e: React.MouseEvent) => {
        if (FULL_PAGE_404_ROUTES.includes(href)) {
            e.preventDefault();
            router.visit('/errors/404', {
                preserveState: true,
                preserveScroll: true
            });
            return;
        }
    };

    return (
        <Link
            {...rest}
            href={href}
            aria-label={ariaLabel}
            role="menuitem"
            onClick={handleClick}
            className={`flex items-center gap-3 px-3 py-1 hover:bg-background-lighter ${active ? 'text-primary-100' : 'text-dark'} ${className}`}
        >
            {children}
            <p>{title}</p>
        </Link>
    );
}
