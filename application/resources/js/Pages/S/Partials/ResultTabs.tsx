import { SearchResultCounts } from '@/types/search';
import { Tab, TabList } from '@headlessui/react';

interface TabConfig {
    name: string;
    label: string;
}

interface ResultTabsProps {
    counts: SearchResultCounts;
    tabConfig: TabConfig[];
}

const ResultTabs = ({ counts, tabConfig }: ResultTabsProps) => {
    return (
        <TabList className="flex flex-row items-center gap-3 border-b border-b-gray-300 text-content-lighter">
            {tabConfig.map((tab) => (
                <Tab
                    key={tab.name}
                    className="group flex items-center gap-2 py-2 outline-none transition-colors hover:text-content-dark data-[selected]:border-b-2 data-[selected]:border-b-primary data-[selected]:text-primary"
                >
                    <span className="font-medium">{tab.label}</span>
                    <span className="flex min-w-[2em] items-center justify-center rounded-full border px-2 py-0.5 text-sm transition-all group-data-[selected]:border-primary group-data-[selected]:bg-blue-50">
                        {counts[tab.name as keyof SearchResultCounts]}
                    </span>
                </Tab>
            ))}
        </TabList>
    );
};

export default ResultTabs;
