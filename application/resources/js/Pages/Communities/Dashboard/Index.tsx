import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import CommunityLayout from '../CommunityLayout';
import CommunityFundingChart from '../Partials/CommunityFundingChart';
import CommunityData = App.DataTransferObjects.CommunityData;

interface DashboardPageProps {
    community: CommunityData;
    amountAwardedChartData: Array<any>;
    amountDistributedChartData: Array<any>;
    amountRemainingChartData: Array<any>;
}

export default function Proposals({
    community,
    amountAwardedChartData,
    amountDistributedChartData,
    amountRemainingChartData,
}: DashboardPageProps) {
    const { t } = useTranslation();
    const awardedFilterOptions = [
        ...((community?.amount_awarded_ada ?? 0) > 0
            ? [
                  {
                      id: 'ADA',
                      value: 'ADA',
                      label: t('communities.filters.totalAdaAwarded'),
                  },
              ]
            : []),
        ...((community?.amount_awarded_usd ?? 0) > 0
            ? [
                  {
                      id: 'USD',
                      value:'USD',
                      label: t('communities.filters.totalUsdAwarded'),
                  },
              ]
            : []),
    ];

    const distributedFilterOptions = [
        ...((community?.amount_awarded_ada ?? 0) > 0
            ? [
                  {
                      id: 'ADA',
                      value: 'ADA',
                      label: t('communities.filters.totalAdaDistributed'),
                  },
              ]
            : []),
        ...((community?.amount_awarded_usd ?? 0) > 0
            ? [
                  {
                      id: 'USD',
                      value:'USD',
                      label: t('communities.filters.totalUsdDistributed'),
                  },
              ]
            : []),
    ];
    const remainedOptions = [
        ...((community?.amount_awarded_ada ?? 0) > 0
            ? [
                  {
                      id: 'ADA',
                      value: 'ADA',
                      label: t('communities.filters.totalAdaRemaining'),
                  },
              ]
            : []),
        ...((community?.amount_awarded_usd ?? 0) > 0
            ? [
                  {
                      id: 'USD',
                      value:'USD',
                      label: t('communities.filters.totalUsdRemaining'),
                  },
              ]
            : []),
    ];

    return (
        <CommunityLayout community={community}>
            <Head title={`${community?.title} - Dashboard`} />
            <div className="grid grid-cols-1 gap-4">
                <CommunityFundingChart
                    adaData={amountAwardedChartData[0]?.data}
                    usdData={amountAwardedChartData[1]?.data}
                    filterOptions={awardedFilterOptions}
                    filtersTitle={t('communities.totalAwarded')}
                    chartTitle={t('communities.totalAmountAwarded')}
                    legend={t('communities.totalAwarded')}
                />

                <CommunityFundingChart
                    adaData={amountDistributedChartData[0]?.data}
                    usdData={amountDistributedChartData[1]?.data}
                    filterOptions={distributedFilterOptions}
                    filtersTitle={t('communities.totalDistributed')}
                    chartTitle={t('communities.totalAmountDistributed')}
                    legend={t('communities.totalDistributed')}
                />

                <CommunityFundingChart
                    adaData={amountRemainingChartData[0]?.data}
                    usdData={amountRemainingChartData[1]?.data}
                    filterOptions={remainedOptions}
                    filtersTitle={t('communities.totalRemained')}
                    chartTitle={t('communities.totalAmountRemaining')}
                    legend={t('communities.totalRemained')}
                />
            </div>
        </CommunityLayout>
    );
}
