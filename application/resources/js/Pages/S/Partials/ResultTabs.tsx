import { SearchResultCounts } from '@/types/search';
import { useLaravelReactI18n } from 'laravel-react-i18n';

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
    const { t } = useLaravelReactI18n();

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
    };
    const activeTabClassName =
        '-mb-px border-b-[5px] border-b-[#2596BE] !text-[#2596BE]';

    return (
        <div className="text-content-lighter scrollbar-none relative flex flex-row items-center gap-6 overflow-x-auto border-b border-gray-100 pb-0 whitespace-nowrap">
            {tabConfig.map((tab) => (
                <a
                    key={tab.name}
                    href={`#section-${tab.name}`}
                    className={`group hover:text-content-dark flex flex-shrink-0 items-center gap-2 py-2 outline-hidden transition-colors ${
                        activeTab === tab.name ? activeTabClassName : ''
                    }`}
                    target="_self"
                    onClick={(e) => handleTabClick(tab.name)}
                >
                    <span className="font-bold">
                        {t(`searchResults.tabs.${tab.name}`)}
                    </span>
                    <span
                        className={`flex min-w-[2em] items-center justify-center rounded-full border px-2 py-0.5 text-sm transition-all ${
                            activeTab === tab.name
                                ? 'border-[#2596BE] bg-blue-50 text-[#2596BE]'
                                : ''
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
