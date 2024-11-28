import { useTranslation } from 'react-i18next';
import NavLinkItem from '../atoms/NavLinkItem';
import BarLineIcon from '../svgs/BarLineIcon';
import ChartIcon from '../svgs/ChartIcon';
import CheckIcon from '../svgs/CheckIcon';
import HomeIcon from '../svgs/HomeIcon';
import NoteIcon from '../svgs/NoteIcon';
import NotificationBoxIcon from '../svgs/NotificationBoxIcon';
import PeopleIcon from '../svgs/PeopleIcon';
import {useLocalizedRoute} from "@/utils/localizedRoute";

function AppNavigation() {
    const { t } = useTranslation();
    const navItems = [
        {
            href: useLocalizedRoute('home'),
            title: t('home'),
            icon: <HomeIcon className="text-dark" />,
        },
        {
            href: useLocalizedRoute('proposals.index'),
            title: t('proposals.proposals'),
            icon: <NoteIcon className="text-primary-100" />,
            active: true,
        },
        {
            href: useLocalizedRoute('funds.index'),
            title: t('funds'),
            icon: <CheckIcon className="text-dark" />,
        },
        {
            href: useLocalizedRoute('people.index'),
            title: t('people'),
            icon: <PeopleIcon className="text-dark" />,
        },
        {
            href: useLocalizedRoute('charts.index'),
            title: t('charts'),
            icon: <ChartIcon className="text-dark" />,
        },
        {
            href: useLocalizedRoute('jormungandr.index'),
            title: t('jormungandr'),
            icon: <BarLineIcon className="text-dark" />,
        },
        {
            href: '/active-fund',
            title: t('activeFund'),
            icon: <NotificationBoxIcon className="text-dark" />,
        },
    ];

    return (
        <nav className="flex flex-col justify-between">
            <ul className="menu-gap-y flex flex-1 flex-col px-4">
                {navItems.map(({ href, title, icon }) => (
                    <li key={href}>
                        <NavLinkItem
                            ariaLabel={`${title } ${t('link')}`}
                            href={href}
                            title={title}
                            prefetch
                            async
                        >
                            {icon}
                        </NavLinkItem>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default AppNavigation;
