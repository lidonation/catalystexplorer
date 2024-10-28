import NavLinkItem from '../atoms/NavLinkItem';
import BarLineIcon from '../svgs/BarLineIcon';
import ChartIcon from '../svgs/ChartIcon';
import CheckIcon from '../svgs/CheckIcon';
import HomeIcon from '../svgs/HomeIcon';
import NoteIcon from '../svgs/NoteIcon';
import NotificationBoxIcon from '../svgs/NotificationBoxIcon';
import PeopleIcon from '../svgs/PeopleIcon';

function AppNavigation() {
    const navItems = [
        {
            href: '/',
            title: 'Home',
            icon: <HomeIcon className="text-content-tertiary" />,
        },
        {
            href: '/proposals',
            title: 'Proposals',
            icon: <NoteIcon className="text-primary-100" />,
            active: true,
        },
        {
            href: '/funds',
            title: 'Funds',
            icon: <CheckIcon className="text-content-tertiary" />,
        },
        {
            href: '/people',
            title: 'People',
            icon: <PeopleIcon className="text-content-tertiary" />,
        },
        {
            href: '/charts',
            title: 'Charts',
            icon: <ChartIcon className="text-content-tertiary" />,
        },
        {
            href: '/jormungandr',
            title: 'Jormungandr',
            icon: <BarLineIcon className="text-content-tertiary" />,
        },
        {
            href: '/active-fund',
            title: 'Active Fund',
            icon: <NotificationBoxIcon className="text-content-tertiary" />,
        },
    ];

    return (
        <nav
            className="flex flex-col justify-between"
            aria-label="Sidebar navigation"
        >
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
