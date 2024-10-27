import NavLinkItem from "../atoms/NavLinkItem";
import BarLineIcon from "../svgs/BarLineIcon";
import ChartIcon from "../svgs/ChartIcon";
import CheckIcon from "../svgs/CheckIcon";
import HomeIcon from "../svgs/HomeIcon";
import NoteIcon from "../svgs/NoteIcon";
import NotificationBoxIcon from "../svgs/NotificationBoxIcon";
import PeopleIcon from "../svgs/PeopleIcon";

function AppNavigation() {
    return (
        <nav
            className="flex flex-col justify-between"
            aria-label="Sidebar Navigation"
        >
            <ul className="flex flex-1 flex-col space-y-2 px-4">
                <li>
                    <NavLinkItem href="/" title="Home">
                        <HomeIcon color="#667085" />
                    </NavLinkItem>
                </li>
                <li>
                    <NavLinkItem href="/proposals" active title="Proposals">
                        <NoteIcon color="#2596BE" />
                    </NavLinkItem>
                </li>
                <li>
                    <NavLinkItem href="/funds" title="Funds">
                        <CheckIcon color="#667085" />
                    </NavLinkItem>
                </li>
                <li>
                    <NavLinkItem href="/people" title="People">
                        <PeopleIcon color="#667085" />
                    </NavLinkItem>
                </li>
                <li>
                    <NavLinkItem href="/charts" title="Charts">
                        <ChartIcon color="#667085" />
                    </NavLinkItem>
                </li>
                <li>
                    <NavLinkItem href="/jormungandr" title="Jormungandr">
                        <BarLineIcon color="#667085" />
                    </NavLinkItem>
                </li>
                <li>
                    <NavLinkItem href="/active-fund" title="Active Fund">
                        <NotificationBoxIcon color="#667085" />
                    </NavLinkItem>
                </li>
            </ul>
        </nav>
    );
}

export default AppNavigation;
