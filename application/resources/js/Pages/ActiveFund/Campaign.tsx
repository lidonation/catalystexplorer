import ColorDot from '@/Components/atoms/ColorDot';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import SegmentedBar from '@/Components/SegmentedBar';
import { Segments } from '@/types/segments';
import { currency } from '@/utils/currency';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Markdown from 'marked-react';
import React, { useState, useEffect } from 'react';
import CampaignLayout from './CampaignLayout';
import CampaignClientTabs from './Partials/CampaignClientTabs';
import ProposalsContent from './Partials/ProposalsContent';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { ListProvider } from '@/Context/ListContext';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface CampaignPageProps extends Record<string, unknown> {
    fund: FundData;
    campaign: CampaignData;
    proposals?: ProposalData[];
    pagination?: PaginatedData<ProposalData[]>;
    filters?: SearchParams;
    initialTab?: string;
    amountDistributed?: number;
    amountRemaining?: number;
}

const Campaign: React.FC<CampaignPageProps> = ({
    fund,
    campaign,
    proposals = [],
    pagination,
    filters = {} as SearchParams,
    initialTab = 'overview',
    amountDistributed,
    amountRemaining,
}) => {
    const { t } = useLaravelReactI18n();
    const [activeTab, setActiveTab] = useState(initialTab);
    
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);
    
    useEffect(() => {
        const handlePopState = () => {
            const currentPath = window.location.pathname;
            const isProposalsTab = currentPath.endsWith('/proposals');
            setActiveTab(isProposalsTab ? 'proposals' : 'overview');
        };
        
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);
    
    const segments = [
        {
            label: t('campaigns.status.completed'),
            color: 'bg-success',
            value: campaign?.completed_proposals_count ?? 0,
        },
        {
            label: t('campaigns.status.funded'),
            color: 'bg-warning',
            value: campaign?.funded_proposals_count ?? 0,
        },
        {
            label: t('campaigns.status.unfunded'),
            color: 'bg-primary',
            value: campaign?.unfunded_proposals_count ?? 0,
        },
    ] as Segments[];
    
    const calculatedRemaining = amountRemaining ?? 
        ((campaign?.total_awarded ?? 0) - (amountDistributed ?? campaign?.total_distributed ?? 0));
    const heroImageUrl = campaign?.hero_img_url ?? fund?.hero_img_url;
    const createListRoute = useLocalizedRoute('workflows.bookmarks.index', { step: 1, campaign: campaign.id, context: 'campaign' });
    
    const handleTabChange = (tabKey: string) => {
        setActiveTab(tabKey);
        
        const currentPath = window.location.pathname;
        const basePath = currentPath.replace('/proposals', '');
        const newPath = tabKey === 'proposals' ? `${basePath}/proposals` : basePath;
        
        if (window.location.pathname !== newPath) {
            window.history.replaceState(null, '', newPath);
            
            window.dispatchEvent(new Event('urlchange'));
        }
    };

    return (
        <ListProvider>
            <CampaignLayout campaign={campaign} fund={fund}>
                <div className="px-2 sm:px-8">
                <div className="w-full p-3 sm:p-5 mb-4 mt-4 bg-background rounded-xl shadow-[0px_1px_4px_0px_rgba(16,24,40,0.10)] flex flex-col sm:flex-row justify-start items-start gap-4">
                    <img className="w-full sm:w-72 h-48 sm:h-70 rounded-xl object-cover" src={heroImageUrl} />
                    <div className="flex-1 flex flex-col justify-start items-start gap-3.5">
                        <div className="self-stretch text-content text-lg sm:text-xl font-semibold leading-7">
                            {campaign.title}
                        </div>
                        <div className="bg-indigo-50 self-stretch p-3 sm:p-5 flex flex-col justify-start items-start gap-5">
                            <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                                <div className="flex flex-col justify-start items-start gap-1.5">
                                    <div className="text-black text-lg sm:text-xl font-bold">
                                        {currency(
                                            campaign?.amount ?? 0,
                                            2,
                                            campaign?.currency?.toUpperCase() ?? fund?.currency ?? 'USD',
                                        )}
                                    </div>
                                    <div className="text-black text-sm font-normal">{t('campaigns.budget')}</div>
                                </div>
                                <div className="flex flex-col justify-start items-start gap-1.5">
                                    <div className="text-black text-lg sm:text-xl font-bold">
                                        {campaign.proposals_count}
                                    </div>
                                    <div className="text-black text-sm font-normal">{t('proposals.proposals')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="self-stretch flex flex-col sm:flex-row justify-start items-start sm:items-center gap-4">
                            <div className="flex-1 text-slate-600 text-sm sm:text-base font-normal leading-normal">
                                {campaign.excerpt}
                            </div>
                            <PrimaryLink
                                href={createListRoute}
                                className="px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-medium whitespace-nowrap"
                                data-testid="create-campaign-list-button"
                            >
                                {t('campaigns.createList')}
                            </PrimaryLink>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-background rounded-xl shadow-sm overflow-hidden">
                    <div className="">
                        <CampaignClientTabs
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            proposalsCount={pagination?.total ?? campaign?.proposals_count ?? 0}
                            className="text-content-lighter px-4 sm:px-6 pt-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        />
                    </div>

                    {activeTab === 'overview' ? (
                        <div className="p-4 sm:p-8">
                            <Title level="1" className="font-bold text-center">
                                {currency(
                                    campaign?.amount ?? 0,
                                    2,
                                    campaign?.currency?.toUpperCase() ?? fund?.currency ?? 'USD',
                                )}
                            </Title>
                            <Paragraph className="mb-4 text-gray-persist text-center">
                                {t('campaigns.totalBudgetToBeDistributed')}
                            </Paragraph>

                            <div className='text-center'>
                                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
                                    <div className="flex justify-center items-center gap-[5px]">
                                        <div className="text-content text-sm sm:text-base font-normal">
                                            {t('campaigns.awarded')}:
                                        </div>
                                        <div className="text-content text-sm sm:text-base font-bold">
                                            {currency(
                                                campaign?.total_awarded ?? 0,
                                                2,
                                                campaign?.currency?.toUpperCase() ?? fund?.currency ?? 'USD',
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-center items-center gap-[5px]">
                                        <div className="text-content text-sm sm:text-base font-normal">
                                            {t('campaigns.distributed')}:
                                        </div>
                                        <div className="text-content text-sm sm:text-base font-bold">
                                            {currency(
                                                campaign?.total_distributed ?? 0,
                                                2,
                                                campaign?.currency?.toUpperCase() ?? fund?.currency ?? 'USD',
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-center items-center gap-[5px]">
                                        <div className="text-content text-sm sm:text-base font-normal">
                                            {t('campaigns.remaining')}:
                                        </div>
                                        <div className="text-content text-sm sm:text-base font-bold">
                                            {currency(
                                                calculatedRemaining,
                                                2,
                                                fund?.currency ?? 'USD',
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <SegmentedBar
                                    segments={segments}
                                    tooltipSegments={segments}
                                />
                                <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4">
                                    {segments.map((segment, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <ColorDot color={segment.color} size={3} />
                                            <div className="text-highlight text-xs sm:text-sm">
                                                {segment.label}
                                            </div>
                                            <div className="text-xs sm:text-sm font-medium">
                                                {segment.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <Paragraph className='text-gray-persist'>
                                    ({t('proposals.status.proposalStatus')})
                                </Paragraph>
                            </div>
                            
                            {campaign?.content && (
                                <div className='mt-6 text-content'>
                                    <Markdown>{campaign.content}</Markdown>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 sm:p-6">
                            <ProposalsContent
                                proposals={proposals}
                                pagination={pagination}
                                filters={filters}
                                showTitle={true}
                                className=""
                            />
                        </div>
                    )}
                </div>
            </div>
        </CampaignLayout>
        </ListProvider>
    );
};

export default Campaign;
