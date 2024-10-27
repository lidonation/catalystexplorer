import NavLinkItem from '../atoms/NavLinkItem';
import BookMarkCheckIcon from '../svgs/BookMarkCheckIcon';
import BucketIcon from '../svgs/BucketIcon';
import FolderIcon from '../svgs/FolderIcon';
import MailIcon from '../svgs/MailIcon';

function UserNavigation() {
    return (
        <nav className="border-t border-gray-200 pt-6">
            <ul className="flex flex-1 flex-col space-y-2">
                <li>
                    <NavLinkItem href="/bookmarks" title="My Bookmarks">
                        <BookMarkCheckIcon color="#667085" />
                    </NavLinkItem>
                </li>
                <li>
                    <NavLinkItem href="/votes" title="My Votes">
                        <BucketIcon color="#667085" />
                    </NavLinkItem>
                </li>
                <li>
                    <NavLinkItem href="/knowledge-base" title="Knowledge Base">
                        <FolderIcon color="#667085" />
                    </NavLinkItem>
                </li>
                <li>
                    <NavLinkItem href="/support" title="Support">
                        <MailIcon color="#667085" />
                    </NavLinkItem>
                </li>
            </ul>
        </nav>
    );
}

export default UserNavigation;
