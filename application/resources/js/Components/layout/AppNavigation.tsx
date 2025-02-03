import { useLocalizedRoute } from '@/utils/localizedRoute';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import NavLinkItem from '../atoms/NavLinkItem';
import BarLineIcon from '../svgs/BarLineIcon';
import ChartIcon from '../svgs/ChartIcon';
import CheckIcon from '../svgs/CheckIcon';
import HomeIcon from '../svgs/HomeIcon';
import NoteIcon from '../svgs/NoteIcon';
import NotificationBoxIcon from '../svgs/NotificationBoxIcon';
import PeopleIcon from '../svgs/PeopleIcon';

function AppNavigation() {
    const { t } = useTranslation();
    const { url } = usePage();

    const stripLanguagePrefix = (path: string) => {
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

    const navItems = [
        {
            href: useLocalizedRoute('home'),
            title: t('home'),
            icon: (isActive: boolean) => (
                <HomeIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('proposals.index'),
            title: t('proposals.proposals'),
            icon: (isActive: boolean) => (
                <NoteIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('funds.index'),
            title: t('funds.funds'),
            icon: (isActive: boolean) => (
                <CheckIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('groups.index'),
            title: t('groups'),
            icon: (isActive: boolean) => (
                <CheckIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('ideascaleProfiles.index'),
            title: t('ideascaleProfiles.ideascaleProfiles'),
            icon: (isActive: boolean) => (
                <PeopleIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('charts.index'),
            title: t('charts'),
            icon: (isActive: boolean) => (
                <ChartIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('jormungandr.index'),
            title: t('jormungandr'),
            icon: (isActive: boolean) => (
                <BarLineIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
        {
            href: useLocalizedRoute('voter-tool.index'),
            title: t('activeFund'),
            icon: (isActive: boolean) => (
                <NotificationBoxIcon
                    className={isActive ? 'text-primary-100' : 'text-dark'}
                />
            ),
        },
    ];

    return (
        <nav className="flex flex-col justify-between" role="menu">
            <ul className="menu-gap-y flex flex-1 flex-col px-4" role="menu">
                {navItems.map(({ href, title, icon }) => {
                    const normalizedHref = stripLanguagePrefix(href);
                    const isActive = normalizedUrl === normalizedHref;

                    return (
                        <li key={href}>
                            <NavLinkItem
                                ariaLabel={`${title} ${t('link')}`}
                                href={href}
                                title={title}
                                active={isActive}
                                prefetch
                                async
                            >
                                {icon(isActive)}
                            </NavLinkItem>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default AppNavigation;
