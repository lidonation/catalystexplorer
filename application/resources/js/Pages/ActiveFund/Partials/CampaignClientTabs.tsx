import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import Button from '@/Components/atoms/Button';

interface Tab {
    key: string;
    name: string;
    count?: number;
}

interface CampaignClientTabsProps {
    activeTab: string;
    onTabChange: (tabKey: string) => void;
    proposalsCount?: number;
    className?: string;
}

const CampaignClientTabs: React.FC<CampaignClientTabsProps> = ({
    activeTab,
    onTabChange,
    proposalsCount = 0,
    className = 'text-content-lighter overflow-x-auto overflow-y-hidden pb-1 lg:overflow-x-hidden',
}) => {
    const { t } = useLaravelReactI18n();

    const tabs: Tab[] = [
        {
            key: 'overview',
            name: t('campaigns.overview'),
        },
        {
            key: 'proposals',
            name: t('proposals.proposals'),
            count: proposalsCount,
        },
    ];

    return (
        <div className={className}>
            <nav className="min-w-max border-b border-light-gray-persist">
                <div className="flex flex-row gap-2 md:gap-4">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;
                        
                        return (
                            <Button
                                key={tab.key}
                                onClick={() => onTabChange(tab.key)}
                                className={`
                                    whitespace-nowrap text-sm md:text-base px-1 md:px-2 py-1 group flex items-center gap-1 outline-hidden transition-colors dark:hover:text-gray-persist text-gray-persist
                                    ${isActive ? '-mb-px border-b-2 !text-primary border-b-primary' : ''}
                                `}
                                dataTestId={`campaign-tab-${tab.key}`}
                            >
                                {tab.name}
                            </Button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default CampaignClientTabs;
