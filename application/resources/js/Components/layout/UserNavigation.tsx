import { useTranslation } from 'react-i18next';
import NavLinkItem from '../atoms/NavLinkItem';
import BookMarkCheckIcon from '../svgs/BookMarkCheckIcon';
import BucketIcon from '../svgs/BucketIcon';
import FolderIcon from '../svgs/FolderIcon';
import MailIcon from '../svgs/MailIcon';

function UserNavigation() {
    const { t } = useTranslation();
    const navItems = [
        {
            href: '/bookmarks',
            title: t('navigation.links.bookmarks'),
            icon: <BookMarkCheckIcon className="text-content-tertiary" />,
        },
        {
            href: '/votes',
            title: t('navigation.links.votes'),
            icon: <BucketIcon className="text-content-tertiary" />,
        },
        {
            href: '/knowledge-base',
            title: t('navigation.links.knowledgeBase'),
            icon: <FolderIcon className="text-content-tertiary" />,
        },
        {
            href: '/support',
            title: t('navigation.links.support'),
            icon: <MailIcon className="text-content-tertiary" />,
        },
    ];
    return (
        <nav className="">
            <ul className="flex flex-1 flex-col space-y-2">
                {navItems.map(({ href, title, icon }) => (
                    <li key={href}>
                        <NavLinkItem href={href} title={title}>
                            {icon}
                        </NavLinkItem>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default UserNavigation;
