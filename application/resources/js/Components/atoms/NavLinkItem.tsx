import Paragraph from '@/Components/atoms/Paragraph';
import { Link, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

type NavLinkItemProps = {
    active?: boolean;
    prefetch?: boolean;
    async?: boolean;
    href: string;
    title: string;
    children: ReactNode;
    className?: string;
    ariaLabel?: string;
    showMyPrefix?: boolean;
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
    showMyPrefix = false,
    ...rest
}: NavLinkItemProps) {
    const { url } = usePage();
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            {...rest}
            href={href}
            aria-label={ariaLabel}
            role="menuitem"
            className={`${!showMyPrefix ? 'hover:bg-background-lighter px-3' : 'hover:bg-background pl-0'} flex w-full items-center gap-3 py-1 ${active ? 'text-primary-100' : 'text-dark'} ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            <div className="relative flex items-center">
                {showMyPrefix && (
                    <span
                        className={`text-content bg-background absolute right-full mx-1 pl-1 py-1 text-sm whitespace-nowrap transition-all duration-300 ease-in-out ${
                            isHovered
                                ? 'translate-x-0 opacity-100'
                                : 'pointer-events-none translate-x-2 opacity-0'
                        }`}
                    >
                        {t('my.my')}
                    </span>
                )}
                <Paragraph size="sm">{title}</Paragraph>
            </div>
        </Link>
    );
}
