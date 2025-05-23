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
    const openedAutomatically = useRef(false);
    const userToggled = useRef(false);

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

    // const handleToggleDashboard = () => {
    //     userToggled.current = true;
    //     setDashboardOpen(prev => !prev);
    // };

    const navItems = [
        {
            href: useLocalizedRoute('my.dashboard'),
            title: t('my.dashboard'),
            icon: <LayoutDashboardIcon className="text-dark" />,
        },
        // {
        //     href: '/my/votes',
        //     title: t('votes'),
        //     icon: <BucketIcon className="text-dark" />,
        // },
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
                                        className={`text-dark ${isOnMyRoute ? 'bg-background-dashboard-menu text-content pt-4' : ''} flex ${!isOnMyRoute ? 'cursor-pointer' : 'cursor-not-allowed'} items-center justify-between px-3 py-1 text-sm transition-colors`}
                                        onClick={!isOnMyRoute ? () => setDashboardOpen(!dashboardOpen) : undefined}
                                        role="button"
                                        aria-expanded={dashboardOpen}
                                        aria-label={`${title} ${t('dropdown')}`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">
                                                <BarLineIcon className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'}`} />
                                            </span>
                                            <span>{title}</span>
                                        </div>
                                        {dashboardOpen  ? (
                                            <ArrowUpIcon
                                                height={10}
                                                width={10}
                                                className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'}`}
                                            />
                                        ) : (
                                            <ArrowDownIcon
                                                height={10}
                                                width={10}
                                                className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'}`}
                                            />
                                        )}
                                    </div>

                                    {dashboardOpen && (
                                            <div className={`${isOnMyRoute ? 'bg-background-dashboard-menu pb-4' :  ''} menu-gap-y flex flex-col pl-6`}>
                                            <NavLinkItem
                                                href={useLocalizedRoute(
                                                    'my.dashboard',
                                                )}
                                                title={t('my.userDashboard')}
                                                ariaLabel={`${t('my.userDashboard')} ${t('link')}`}
                                                active={false}
                                                className={`${isOnMyRoute ? 'text-content hover:hover:text-gray-persist' : 'text-dark'} flex items-center gap-2`}
                                            >
                                                <span></span>
                                            </NavLinkItem>

                                            <NavLinkItem
                                                href={useLocalizedRoute(
                                                    'my.profile',
                                                )}
                                                title={t('my.profile')}
                                                ariaLabel={`${t('my.profile')} ${t('link')}`}
                                                active={false}
                                                className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'} flex items-center gap-2`}
                                            >
                                                <span></span>
                                            </NavLinkItem>

                                            <NavLinkItem
                                                href={useLocalizedRoute(
                                                    'my.proposals.index',
                                                )}
                                                title={t('my.proposals')}
                                                ariaLabel={`${t('my.proposals')} ${t('link')}`}
                                                active={false}
                                                className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'} flex items-center gap-2`}
                                            >
                                                <span></span>
                                            </NavLinkItem>
                                            <NavLinkItem
                                                href={useLocalizedRoute(
                                                    'my.reviews',
                                                )}
                                                title={t('my.reviews')}
                                                ariaLabel={`${t('my.reviews')} ${t('link')}`}
                                                active={false}
                                                className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'} flex items-center gap-2`}
                                            >
                                                <span></span>
                                            </NavLinkItem>
                                            <NavLinkItem
                                                href={useLocalizedRoute(
                                                    'my.groups',
                                                )}
                                                title={t('my.groups')}
                                                ariaLabel={`${t('my.groups')} ${t('link')}`}
                                                active={false}
                                               className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'} flex items-center gap-2`}
                                            >
                                                <span></span>
                                            </NavLinkItem>
                                            <NavLinkItem
                                                href={useLocalizedRoute(
                                                    'my.communities',
                                                )}
                                                title={t('my.communities')}
                                                ariaLabel={`${t('my.communities')} ${t('link')}`}
                                                active={false}
                                                className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'} flex items-center gap-2`}
                                            >
                                                <span></span>
                                            </NavLinkItem>
                                            <NavLinkItem
                                                href={useLocalizedRoute(
                                                    'my.lists.index',
                                                )}
                                                title={t('my.lists')}
                                                ariaLabel={`${t('my.lists')} ${t('link')}`}
                                                active={false}
                                                className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'} flex items-center gap-2`}
                                            >
                                                <span></span>
                                            </NavLinkItem>
                                            <NavLinkItem
                                                href={useLocalizedRoute(
                                                    'my.transactions',
                                                )}
                                                title={t('my.transactions')}
                                                ariaLabel={`${t('my.transactions')} ${t('link')}`}
                                                active={false}
                                                className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'} flex items-center gap-2`}
                                            >
                                                <span></span>
                                            </NavLinkItem>
                                            <NavLinkItem
                                                href={useLocalizedRoute(
                                                    'my.votes',
                                                )}
                                                title={t('my.votes')}
                                                ariaLabel={`${t('my.votes')} ${t('link')}`}
                                                active={false}
                                               className={`${isOnMyRoute ? 'text-content hover:text-gray-persist' : 'text-dark'} flex items-center gap-2`}
                                            >
                                                <span></span>
                                            </NavLinkItem>
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    }

                    return (
                        <li key={href}>
                            <NavLinkItem
                                ariaLabel={`${title}  ${t('link')}`}
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
