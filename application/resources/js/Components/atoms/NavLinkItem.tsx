import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

type NavLinkItemProps = {
    active?: boolean;
    prefetch?: boolean;
    async?: boolean;
    href: string;
    title: string;
    children: ReactNode;
    className?: string;
    ariaLabel?:string
};

export default function NavLinkItem({
    children,
    href,
    title,
    className,
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
            role="navigation"
            className={`flex items-center gap-3 px-3 py-1 hover:bg-background-lighter ${className}`}
        >
            {children}
            <p>
                {title}
            </p>
        </Link>
    );
}
