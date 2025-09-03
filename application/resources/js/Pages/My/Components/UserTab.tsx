import { Link } from '@inertiajs/react';

interface TabConfig {
    name: string;
    href: string;
}

interface UserTabProps {
    tabs: TabConfig[];
    activeTab: string;
}

const UserTab = ({ tabs, activeTab }: UserTabProps) => {
    return (
        <div className="text-content-lighter mt-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:mt-8 [&::-webkit-scrollbar]:hidden">
            <nav className="border-b-light-gray-persist min-w-max border-b">
                <div className="flex flex-row gap-2 md:gap-6">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`group hover:text-content-dark flex items-center gap-2 px-2 py-2 text-sm whitespace-nowrap outline-hidden transition-colors md:px-3 md:text-base ${
                                activeTab === tab.name
                                    ? 'border-b-primary text-primary -mb-px border-b-2'
                                    : ''
                            } `}
                        >
                            {tab.name}
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default UserTab;
