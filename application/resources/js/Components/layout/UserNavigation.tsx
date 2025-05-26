import { useLocalizedRoute } from '@/utils/localizedRoute';
import { usePage } from '@inertiajs/react';
import { LayoutDashboardIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NavLinkItem from '../atoms/NavLinkItem';
import ArrowDownIcon from '../svgs/ArrowDownIcon';
import ArrowUpIcon from '../svgs/ArrowUpIcon';
import BarLineIcon from '../svgs/BarLineIcon';
import FolderIcon from '../svgs/FolderIcon';
import MailIcon from '../svgs/MailIcon';

function UserNavigation() {
    const { t } = useTranslation();
    const { url } = usePage();
    const isOnMyRoute = url.includes('/my/');

    const [dashboardOpen, setDashboardOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const openedAutomatically = useRef(false);
    const userToggled = useRef(false);
    const dropdownRef = useRef(null);
    
    const stripLanguagePrefix = (path?: string) => {
        if (!path) return '';

        const isAbsoluteUrl =
            path.startsWith('http://') || path.startsWith('https://');
        const parsedPath = isAbsoluteUrl ? new URL(path).pathname : path;
        const normalizedPath = parsedPath.replace(/^\/(en|fr|sw)(\/|$)/, '/');
        const basePath = normalizedPath.split('?')[0];
        return basePath.endsWith('/') && basePath !== '/'
            ? basePath.slice(0, -1)
            : basePath;
    };

    const normalizedUrl = stripLanguagePrefix(url);

    useEffect(() => {
        if (isOnMyRoute) {
            setDashboardOpen(true);
            openedAutomatically.current = true;
        } else {
            if (!userToggled.current) {
                setDashboardOpen(false);
            }
            openedAutomatically.current = false;
        }
    }, [isOnMyRoute]);

    const navItems = [
        {
            href: useLocalizedRoute('my.dashboard'),
            title: t('my.dashboard'),
            icon: <LayoutDashboardIcon className="text-dark" />,
        },
        {
            href: '/knowledge-base',
            title: t('knowledgeBase'),
            icon: <FolderIcon className="text-dark" />,
        },
        {
            href: '/support',
            title: t('support'),
            icon: <MailIcon className="text-dark" />,
        },
    ];

    const dashboardItems = [
        {
            route: 'my.dashboard',
            title: t('my.userDashboard'),
            ariaLabel: `${t('my.userDashboard')} ${t('link')}`,
        },
        {
            route: 'my.profile',
            title: t('my.profile'),
            ariaLabel: `${t('my.profile')} ${t('link')}`,
        },
        {
            route: 'my.proposals.index',
            title: t('my.proposals'),
            ariaLabel: `${t('my.proposals')} ${t('link')}`,
        },
        {
            route: 'my.reviews',
            title: t('my.reviews'),
            ariaLabel: `${t('my.reviews')} ${t('link')}`,
        },
        {
            route: 'my.groups',
            title: t('my.groups'),
            ariaLabel: `${t('my.groups')} ${t('link')}`,
        },
        {
            route: 'my.communities',
            title: t('my.communities'),
            ariaLabel: `${t('my.communities')} ${t('link')}`,
        },
        {
            route: 'my.lists.index',
            title: t('my.lists'),
            ariaLabel: `${t('my.lists')} ${t('link')}`,
        },
        {
            route: 'my.transactions',
            title: t('my.transactions'),
            ariaLabel: `${t('my.transactions')} ${t('link')}`,
        },
        {
            route: 'my.votes',
            title: t('my.votes'),
            ariaLabel: `${t('my.votes')} ${t('link')}`,
        },
    ];

    return (
        <nav className="" role="menu">
            <ul className="flex flex-1 flex-col gap-1" role="menu">
                {navItems.map(({ href, title, icon }) => {
                    const isDashboard = title === t('my.dashboard');
                    if (isDashboard) {
                        return (
                            <li key={title}>
                                <div>
                                    <div
                                        className={`text-dark ${isOnMyRoute ? 'bg-background-dashboard-menu text-content pt-4' : ''} cursor-pointer flex items-center justify-between px-3 py-1 text-sm transition-all duration-200 ease-in-out`}
                                        onClick={() =>
                                            setDashboardOpen(!dashboardOpen)
                                        }
                                        role="button"
                                        aria-expanded={dashboardOpen}
                                        aria-label={`${title} ${t('dropdown')}`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">
                                                <BarLineIcon
                                                    className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'} transition-colors duration-200`}
                                                />
                                            </span>
                                            <span>{title}</span>
                                        </div>
                                        <div
                                            className={`transform transition-transform duration-300 ease-in-out ${dashboardOpen ? 'rotate-180' : 'rotate-0'}`}
                                        >
                                            {dashboardOpen ? (
                                                <ArrowUpIcon
                                                    height={10}
                                                    width={10}
                                                    className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'} transition-colors duration-200`}
                                                />
                                            ) : (
                                                <ArrowDownIcon
                                                    height={10}
                                                    width={10}
                                                    className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'} transition-colors duration-200`}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        ref={dropdownRef}
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                            dashboardOpen
                                                ? 'max-h-96 opacity-100'
                                                : 'max-h-0 opacity-0'
                                        }`}
                                        style={{
                                            transitionProperty:
                                                'max-height, opacity, padding',
                                        }}
                                    >
                                        <div
                                            className={`${isOnMyRoute ? 'bg-background-dashboard-menu pb-4' : ''} menu-gap-y flex transform flex-col pl-6 transition-transform duration-300 ease-in-out ${
                                                dashboardOpen
                                                    ? 'translate-y-0'
                                                    : '-translate-y-2'
                                            }`}
                                        >
                                            {dashboardItems?.map(
                                                ({
                                                    route,
                                                    title,
                                                    ariaLabel,
                                                }) => {
                                                    const href =
                                                        useLocalizedRoute(
                                                            route,
                                                        );
                                                    const normalizedHref = href
                                                        ? stripLanguagePrefix(
                                                              href,
                                                          )
                                                        : '';
                                                    const isActive =
                                                        normalizedUrl ===
                                                        normalizedHref;
                                                    const isHovered = hoveredItem === route;
                                                    
                                                    return (
                                                        <div
                                                            onMouseEnter={() =>
                                                                setHoveredItem(route)
                                                            }
                                                            onMouseLeave={() =>
                                                                setHoveredItem(null)
                                                            }
                                                            className="flex items-center"
                                                            key={route}
                                                        >
                                                            <NavLinkItem
                                                                key={route}
                                                                href={href}
                                                                title={isHovered ? t('my.my') + ' ' + title : title}
                                                                ariaLabel={
                                                                    ariaLabel
                                                                }
                                                                active={
                                                                    isActive
                                                                }
                                                                className={`${isOnMyRoute ? 'text-content hover:bg-background' : ''} ${isActive ? 'bg-active-dashboard-menu' : ''} flex items-center gap-2 transition-colors duration-200 w-full`}
                                                            >
                                                                <span></span>
                                                            </NavLinkItem>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    }

                    return (
                        <li key={href}>
                            <NavLinkItem
                                ariaLabel={`${title} ${t('link')}`}
                                href={href}
                                title={title}
                                prefetch
                            >
                                {icon}
                            </NavLinkItem>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default UserNavigation;