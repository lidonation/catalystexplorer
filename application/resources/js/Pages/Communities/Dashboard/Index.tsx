import { Head } from '@inertiajs/react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import CommunityLayout from '../CommunityLayout';
import CommunityFundingChart from '../Partials/CommunityFundingChart';
import CommunityData = App.DataTransferObjects.CommunityData;

interface DashboardPageProps {
    community: CommunityData;
    amountAwardedChartData: Array<any>;
    amountDistributedChartData: Array<any>;
    amountRemainingChartData: Array<any>;
    ownProposals: number;
    collaboratingProposals: number;
}

export default function Proposals({
    community,
    amountAwardedChartData,
    amountDistributedChartData,
    amountRemainingChartData,
    ownProposals,
    collaboratingProposals,
}: DashboardPageProps) {
    const { t } = useLaravelReactI18n();
    const awardedFilterOptions = [
        [
            {
                id: 'ADA',
                value: 'ADA',
                label: t('communities.filters.totalAdaAwarded'),
            },
        ],
        [
            {
                id: 'USD',
                value: 'USD',
                label: t('communities.filters.totalUsdAwarded'),
            },
        ]
    ];

    const distributedFilterOptions = [
        [
            {
                id: 'ADA',
                value: 'ADA',
                label: t('communities.filters.totalAdaDistributed'),
            },
        ],
        [
            {
                id: 'USD',
                value: 'USD',
                label: t('communities.filters.totalUsdDistributed'),
            },
        ],
    ];
    const remainedOptions = [
        [
            {
                id: 'ADA',
                value: 'ADA',
                label: t('communities.filters.totalAdaRemaining'),
            },
        ],
        [
            {
                id: 'USD',
                value: 'USD',
                label: t('communities.filters.totalUsdRemaining'),
            },
        ],
    ];

    return (
        <CommunityLayout
            community={community}
            ownProposalsCount={ownProposals}
            coProposalsCount={collaboratingProposals}
        >
            <Head title={`${community?.title} - Dashboard`} />
            <div className="grid grid-cols-1 gap-4">
                <CommunityFundingChart
                    adaData={amountAwardedChartData[0]?.data}
                    usdData={amountAwardedChartData[1]?.data}
                    filterOptions={awardedFilterOptions.flat()}
                    filtersTitle={t('communities.totalAwarded')}
                    chartTitle={t('communities.totalAmountAwarded')}
                    legend={t('communities.totalAwarded')}
                />

                <CommunityFundingChart
                    adaData={amountDistributedChartData[0]?.data}
                    usdData={amountDistributedChartData[1]?.data}
                    filterOptions={distributedFilterOptions.flat()}
                    filtersTitle={t('communities.totalDistributed')}
                    chartTitle={t('communities.totalAmountDistributed')}
                    legend={t('communities.totalDistributed')}
                />

                <CommunityFundingChart
                    adaData={amountRemainingChartData[0]?.data}
                    usdData={amountRemainingChartData[1]?.data}
                    filterOptions={remainedOptions.flat()}
                    filtersTitle={t('communities.totalRemained')}
                    chartTitle={t('communities.totalAmountRemaining')}
                    legend={t('communities.totalRemained')}
                />
            </div>
        </CommunityLayout>
    );
}
