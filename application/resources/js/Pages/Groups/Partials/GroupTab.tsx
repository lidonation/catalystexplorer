import { Link } from '@inertiajs/react';
import type { Tab } from '@/utils/routeTabs';

interface GroupTabProps {
    tabs: Tab[];
    activeTab: string;
}

export default function GroupTabs({ tabs, activeTab }: GroupTabProps) {
    return (
        <div className=" text-content-lighter [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-auto">
            <nav className="min-w-max border-b border-b-light-gray-persist">
                <div className="flex flex-row gap-2 md:gap-6">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.name;

                        return (
                            <Link
                                key={tab.routeName}
                                href={tab.href}
                                className={`
                                    whitespace-nowrap text-sm md:text-base px-2 md:px-3 py-2
                                    group flex items-center gap-2 outline-hidden transition-colors
                                    hover:text-content-dark
                                    ${isActive 
                                        ? '-mb-px border-b-2 border-b-primary text-primary'
                                        : ''
                                    }
                                `}
                            >
                                {tab.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
