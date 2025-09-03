import { truncateMiddle } from '@/utils/truncateMiddle';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import React from 'react';
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
    maxLabelLength?: number;
}

const Breadcrumbs = ({
    items,
    separator = <ChevronRight className="text-content h-4 w-4" />,
    maxItems = 4,
    itemClassName = 'text-content hover:text-content-light transition-colors',
    activeClassName = 'text-content font-medium',
    maxLabelLength = 30,
}: BreadcrumbsProps) => {
    const { t } = useLaravelReactI18n();
    const displayItems =
        items.length > maxItems
            ? [
                  ...items.slice(0, 1),
                  { label: '...', href: '', isEllipsis: true },
                  ...items.slice(-2),
              ]
            : items;

    if (
        (displayItems.length === 1 &&
            displayItems[0].label === t('breadcrumbs.home')) ||
        displayItems.some((item) => item.href.includes('workflows')) ||
        displayItems.some((item) => item.href.includes('dreps')) ||
        displayItems.some((item) => item.href.includes('votes')) ||
        displayItems.some((item) => item.href.includes('password')) ||
        displayItems.some((item) => item.href.includes('login')) ||
        displayItems.some((item) => item.href.includes('register'))
    ) {
        //don't display breadcrumbs if there is only one item and it's 'Home' or part of the workflow
        return null;
    }

    const formatLabel = (label: string, isHome: boolean) => {
        if (isHome) {
            return <HomeIcon className="text-content" />;
        }

        return truncateMiddle(label, maxLabelLength);
    };

    return (
        <nav
            aria-label="Breadcrumb"
            className="container flex items-center space-x-2 overflow-x-auto pt-5 pl-8 text-sm whitespace-nowrap"
            data-testid="breadcrumbs"
        >
            {displayItems.map((item, index) => {
                const isLast = index === displayItems.length - 1;
                const isEllipsis = item.isEllipsis;
                const isHome = item.label.includes(t('breadcrumbs.home'));

                return (
                    <React.Fragment key={item.href || index}>
                        {index > 0 && (
                            <span className="flex items-center">
                                {separator}
                            </span>
                        )}

                        {isEllipsis ? (
                            <MoreHorizontal className="text-content h-4 w-4" />
                        ) : isLast ? (
                            <span className={activeClassName}>
                                {formatLabel(item.label, isHome)}
                            </span>
                        ) : (
                            <Link
                                href={item.href}
                                className={itemClassName}
                                data-testid={`breadcrumb-link-${item.label}`}
                            >
                                {formatLabel(item.label, isHome)}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export const generateBreadcrumbs = (currentRoute: string, locale: string) => {
    const { t } = useLaravelReactI18n();
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
