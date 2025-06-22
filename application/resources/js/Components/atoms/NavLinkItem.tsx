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
    children?: ReactNode;
    className?: string;
    ariaLabel?: string;
    showMyPrefix?: boolean;
    disable?: boolean;
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
    disable = false,
    ...rest
}: NavLinkItemProps) {
    const { url } = usePage();
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`relative w-full ${disable ? 'bg-opacity-50 z-50 cursor-not-allowed' : ''}`}
        >
            <Link
                {...rest}
                href={!disable ? href : '#'}
                aria-disabled={disable}
                aria-label={ariaLabel}
                role="menuitem"
                onClick={disable ? (e) => e.preventDefault() : undefined}
                className={`flex w-full items-center gap-3 py-1 transition-opacity ${
                    !showMyPrefix
                        ? 'hover:bg-background-lighter px-3'
                        : 'hover:bg-background pl-0'
                } ${active ? 'text-primary-100' : 'text-dark'} ${disable ? 'pointer-events-none opacity-50' : ''} ${className}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {children}
                <div className="relative flex w-full items-center justify-between">
                    {showMyPrefix && (
                        <span
                            className={`text-content bg-background absolute right-full mx-1 py-1 pl-1 text-sm whitespace-nowrap transition-all duration-300 ease-in-out ${
                                isHovered
                                    ? 'translate-x-0 opacity-100'
                                    : 'pointer-events-none translate-x-2 opacity-0'
                            }`}
                        >
                            {t('my.my')}
                        </span>
                    )}
                    <Paragraph size="sm">{title}</Paragraph>
                    {disable && (
                        <Paragraph size="sm" className="ml-3 text-nowrap">
                            {t('Coming Soon!')}
                        </Paragraph>
                    )}
                </div>
            </Link>
        </div>
    );
}
