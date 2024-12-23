import { SearchResultCounts } from '@/types/search';
import { Tab, TabList } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

interface TabConfig {
    name: string;
    label: string;
}

interface ResultTabsProps {
    counts: SearchResultCounts;
    tabConfig: TabConfig[];
}

const ResultTabs = ({ counts, tabConfig }: ResultTabsProps) => {
    const { t } = useTranslation();
    
    return (
        <TabList className="flex flex-row items-center gap-6 border-b border-b-light-gray-persist text-content-lighter">
            {tabConfig.map((tab) => (
                <Tab
                    key={tab.name}
                    className="group flex items-center gap-2 py-2 outline-none transition-colors hover:text-content-dark data-[selected]:border-b-2 data-[selected]:border-b-primary data-[selected]:-mb-px data-[selected]:text-primary"
                >
                    <span className="font-medium">
                        {t(`searchResults.tabs.${tab.name.toLowerCase()}`)}
                    </span>
                    <span className="flex min-w-[2em] items-center justify-center rounded-full border px-2 py-0.5 text-sm transition-all group-data-[selected]:border-primary group-data-[selected]:bg-blue-50">
                        {counts[tab.name as keyof SearchResultCounts]}
                    </span>
                </Tab>
            ))}
        </TabList>
    );
};

export default ResultTabs;