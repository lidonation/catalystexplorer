import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

type NavLinkItemProps = {
    active?: boolean;
    href: string;
    title: string;
    children: ReactNode;
    className?: string;
};

export default function NavLinkItem({
    active = false,
    children,
    href,
    title,
    className,
}: NavLinkItemProps) {
    return (
        <Link
            href={href}
            aria-current={active ? 'page' : undefined}
            role="navigation"
            className={`flex items-center gap-3 px-3 py-1 hover:bg-background-secondary ${active ? 'rounded-md bg-background-secondary' : ''} ${className}`}
            prefetch
        >
            {children}
            <p
                className={`${active ? 'text-content-secondary' : 'text-content-primary'} text-lg font-medium`}
            >
                {title}
            </p>
        </Link>
    );
}
