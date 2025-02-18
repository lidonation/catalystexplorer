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
        <div className="mt-4 md:mt-8 text-content-lighter [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-auto">
            <nav className="min-w-max border-b border-b-light-gray-persist">
                <div className="flex flex-row gap-2 md:gap-6">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`
                                whitespace-nowrap text-sm md:text-base px-2 md:px-3 py-2
                                group flex items-center gap-2 outline-hidden transition-colors
                                hover:text-content-dark 
                                ${activeTab === tab.name 
                                    ? '-mb-px border-b-2 border-b-primary text-primary'
                                    : ''
                                }
                            `}
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
