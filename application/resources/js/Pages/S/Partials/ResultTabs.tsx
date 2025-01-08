import { SearchResultCounts } from '@/types/search';
import { useTranslation } from 'react-i18next';

interface TabConfig {
    name: string;
    label: string;
}

interface ResultTabsProps {
    counts: SearchResultCounts;
    tabConfig: TabConfig[];
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const ResultTabs = ({
    counts,
    tabConfig,
    activeTab,
    setActiveTab,
}: ResultTabsProps) => {
    const { t } = useTranslation();

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
    };
    return (
        <div className="text-content-lighter flex flex-row items-center gap-6 border-b border-b-light-gray-persist">
            {tabConfig.map((tab) => (
                <a
                    key={tab.name}
                    href={`#section-${tab.name}`}
                    className={`group flex items-center gap-2 py-2 outline-none transition-colors hover:text-content-dark ${
                        activeTab === tab.name &&
                        '-mb-px border-b-2 border-b-primary text-primary'
                    }`}
                    target="_self"
                    onClick={(e) => handleTabClick(tab.name)}
                >
                    <span className="font-medium">
                        {t(`searchResults.tabs.${tab.name.toLowerCase()}`)}
                    </span>
                    <span
                        className={`flex min-w-[2em] items-center justify-center rounded-full border px-2 py-0.5 text-sm transition-all ${
                            activeTab === tab.name &&
                            'border-primary bg-blue-50'
                        }`}
                    >
                        {counts[tab.name as keyof SearchResultCounts]}
                    </span>
                </a>
            ))}
        </div>
    );
};

export default ResultTabs;
