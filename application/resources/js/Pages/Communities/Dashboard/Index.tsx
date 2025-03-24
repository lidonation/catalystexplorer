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
                      label: t('communities.filters.totalAda'),
                  },
              ]
            : []),
        ...((community?.amount_awarded_usd ?? 0) > 0
            ? [
                  {
                      id: 'USD',
                      value:'USD',
                      label: t('communities.filters.totalUsd'),
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
                    filtersTitle="Amount Awarded ADA & USD"
                    chartTitle={t('communities.totalAmountAwarded')}
                />

                <CommunityFundingChart
                    adaData={amountDistributedChartData[0]?.data}
                    usdData={amountDistributedChartData[1]?.data}
                    filterOptions={awardedFilterOptions}
                    filtersTitle="Amount Distributed ADA & USD"
                    chartTitle={t('communities.totalAmountDistributed')}
                />

                <CommunityFundingChart
                    adaData={amountRemainingChartData[0]?.data}
                    usdData={amountRemainingChartData[1]?.data}
                    filterOptions={awardedFilterOptions}
                    filtersTitle="Amount Awarded ADA & USD"
                    chartTitle={t('communities.totalAmountRemaining')}
                />
            </div>
        </CommunityLayout>
    );
}
