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
    children,
    href,
    title,
    className,
    ...rest
}: NavLinkItemProps) {
    return (
        <Link
            {...rest}
            href={href}
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
