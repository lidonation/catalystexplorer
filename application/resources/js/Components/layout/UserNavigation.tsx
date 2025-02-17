import { useTranslation } from 'react-i18next';
import NavLinkItem from '../atoms/NavLinkItem';
import FolderIcon from '../svgs/FolderIcon';
import MailIcon from '../svgs/MailIcon';
import {LayoutDashboardIcon} from "lucide-react";

function UserNavigation() {
    const { t } = useTranslation();
    const navItems = [
        {
            href: '/my/dashboard',
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
            <ul className="gap-1 flex flex-1 flex-col" role="menu">
                {navItems.map(({ href, title, icon }) => (
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
                ))}
            </ul>
        </nav>
    );
}

export default UserNavigation;
