import { Link } from '@inertiajs/react';
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
    return (
        <Link
            {...rest}
            href={href}
            aria-label={ariaLabel}
            role="menuitem"
            className={`hover:bg-background-lighter flex items-center gap-3 px-3 py-1 ${active ? 'text-primary-100' : 'text-dark'} ${className}`}
        >
            {children}
            <Paragraph>{title}</Paragraph>
        </Link>
    );
}