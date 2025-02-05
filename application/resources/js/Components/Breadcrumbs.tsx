import { Link } from '@inertiajs/react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import HomeIcon from './svgs/HomeIcon';

interface BreadcrumbItem {
    label: string;
    href: string;
    isEllipsis?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    maxItems?: number;
    itemClassName?: string;
    activeClassName?: string;
}

const Breadcrumbs = ({
    items,
    separator = <ChevronRight className="h-4 w-4 text-content" />,
    maxItems = 4,
    itemClassName = 'text-content hover:text-content-light transition-colors',
    activeClassName = 'text-content font-medium',
}: BreadcrumbsProps) => {
    const { t } = useTranslation();
    const displayItems =
        items.length > maxItems
            ? [
                  ...items.slice(0, 1),
                  { label: '...', href: '', isEllipsis: true },
                  ...items.slice(-2),
              ]
            : items;

    if (
        displayItems.length === 1 &&
        displayItems[0].label === t('breadcrumbs.home')
    ) {
        //don't display breadcrumbs if there is only one item and it's 'Home'
        return null;
    }

    return (
        <nav
            aria-label="Breadcrumb"
            className="container flex items-center space-x-2 pl-8 pt-5 text-sm"
        >
            {displayItems.map((item, index) => {
                const isLast = index === displayItems.length - 1;
                const isEllipsis = item.isEllipsis;

                return (
                    <React.Fragment key={item.href || index}>
                        {index > 0 && (
                            <span className="flex items-center">
                                {separator}
                            </span>
                        )}

                        {isEllipsis ? (
                            <MoreHorizontal className="h-4 w-4 text-content" />
                        ) : isLast ? (
                            <span className={activeClassName}>
                                {item.label}
                            </span>
                        ) : (
                            <Link href={item.href} className={itemClassName}>
                                {item.label.includes(t('breadcrumbs.home')) ? (
                                    <HomeIcon className="text-content" />
                                ) : (
                                    item.label
                                )}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export const generateBreadcrumbs = (currentRoute: string, locale: string) => {
    const { t } = useTranslation();
    const routeWithoutLocale = currentRoute.replace(
        new RegExp(`^/${locale}`),
        '',
    );
    const segments = routeWithoutLocale.split('/').filter(Boolean);
    const breadcrumbs = [];

    breadcrumbs.push({ label: `${t('breadcrumbs.home')}`, href: '/' });

    let path = '';
    segments.forEach((segment) => {
        path += `/${segment}`;
        breadcrumbs.push({
            label:
                segment.charAt(0).toUpperCase() +
                segment.slice(1).replace(/-/g, ' '),
            href: path,
        });
    });

    return breadcrumbs;
};

export default Breadcrumbs;
