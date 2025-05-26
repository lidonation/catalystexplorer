import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import Paragraph from '@/Components/atoms/Paragraph';

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
      const { url } = usePage();
        const isOnMyRoute = url.includes('/my/');
    return (
        <Link
            {...rest}
            href={href}
            aria-label={ariaLabel}
            role="menuitem"
            className={`${!isOnMyRoute ? 'hover:bg-background-lighter' : 'hover:bg-active-dashboard-menu'} flex items-center gap-3 px-3 py-1 ${active ? 'text-primary-100' : 'text-dark'} ${className}`}
        >
            {children}
            <Paragraph size="sm">
                {title}
            </Paragraph>
        </Link>
    );
}