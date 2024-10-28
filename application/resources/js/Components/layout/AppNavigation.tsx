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
    const navItems = [
        {
            href: '/',
            title: t('navigation.links.home'),
            icon: <HomeIcon className="text-content-tertiary" />,
        },
        {
            href: '/proposals',
            title: t('navigation.links.proposals'),
            icon: <NoteIcon className="text-primary-100" />,
            active: true,
        },
        {
            href: '/funds',
            title: t('navigation.links.funds'),
            icon: <CheckIcon className="text-content-tertiary" />,
        },
        {
            href: '/people',
            title: t('navigation.links.people'),
            icon: <PeopleIcon className="text-content-tertiary" />,
        },
        {
            href: '/charts',
            title: t('navigation.links.charts'),
            icon: <ChartIcon className="text-content-tertiary" />,
        },
        {
            href: '/jormungandr',
            title: t('navigation.links.jormungandr'),
            icon: <BarLineIcon className="text-content-tertiary" />,
        },
        {
            href: '/active-fund',
            title: t('navigation.links.activeFund'),
            icon: <NotificationBoxIcon className="text-content-tertiary" />,
        },
    ];

    return (
        <nav className="flex flex-col justify-between">
            <ul className="flex flex-1 flex-col space-y-2 px-4">
                {navItems.map(({ href, title, icon, active }) => (
                    <li key={href}>
                        <NavLinkItem href={href} title={title} active={active}>
                            {icon}
                        </NavLinkItem>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default AppNavigation;
