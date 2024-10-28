import NavLinkItem from '../atoms/NavLinkItem';
import BookMarkCheckIcon from '../svgs/BookMarkCheckIcon';
import BucketIcon from '../svgs/BucketIcon';
import FolderIcon from '../svgs/FolderIcon';
import MailIcon from '../svgs/MailIcon';

function UserNavigation() {
    const navItems = [
        {
            href: '/bookmarks',
            title: 'My Bookmarks',
            icon: <BookMarkCheckIcon className="text-content-tertiary" />,
        },
        {
            href: '/votes',
            title: 'My Votes',
            icon: <BucketIcon className="text-content-tertiary" />,
        },
        {
            href: '/knowledge-base',
            title: 'Knowledge Base',
            icon: <FolderIcon className="text-content-tertiary" />,
        },
        {
            href: '/support',
            title: 'Support',
            icon: <MailIcon className="text-content-tertiary" />,
        },
    ];
    return (
        <nav className="border-t border-gray-200 pt-6">
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
