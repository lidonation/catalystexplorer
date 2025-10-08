import AllChartsLayout from '../AllChartsLayout';
import FundTalliesWidget from '@/Pages/ActiveFund/Partials/FundTalliesWidget';
import FundTalliesWidgetLoader from '../partials/FundTalliesWidgetLoader';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { PaginatedData } from '@/types/paginated-data';
import type { SearchParams } from '@/types/search-params';
import CatalystTallyData = App.DataTransferObjects.CatalystTallyData;
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;

type LiveTallyProps = {
    fund: FundData;
    funds?: Array<{ id: string | number; title: string; amount?: number }>;
    campaigns?: CampaignData[] | null;
    tallies?: (PaginatedData<CatalystTallyData[]> & {
        total_votes_cast?: number;
        last_updated?: string;
    }) | null;
    filters?: SearchParams;
    activeTabRoute?: string | null;
};

const LiveTally: React.FC<LiveTallyProps> = ({
    fund,
    funds = [],
    campaigns,
    tallies,
    filters,
    activeTabRoute,
}) => {
    const { t } = useLaravelReactI18n();

    return (
        <AllChartsLayout
            fund={fund}
            funds={funds}
            filters={filters}
            activeTabRoute={activeTabRoute}
        >
            <Head title={`${t('charts.title')} – ${t('charts.tabs.liveTally')}`} />
            <div className="space-y-8">
                <section>
                    <WhenVisible
                        data={['campaigns', 'tallies']}
                        fallback={<FundTalliesWidgetLoader />}
                    >
                        <FundTalliesWidget
                            tallies={tallies ?? undefined}
                            campaigns={campaigns ?? []}
                            funds={funds}
                            filters={filters}
                            routerOptions={{
                                only: ['tallies', 'campaigns'],
                                preserveState: true,
                                preserveScroll: true,
                            }}
                            showPagination
                            showFilters
                            customTitle={t('activeFund.votingStats')}
                            lastUpdated={tallies?.last_updated}
                        />
                    </WhenVisible>
                </section>
            </div>
        </AllChartsLayout>
    );
};

export default LiveTally;
