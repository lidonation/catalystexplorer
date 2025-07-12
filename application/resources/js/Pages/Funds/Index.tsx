import Title from '@/Components/atoms/Title';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import FundCardLoader from './Partials/FundCardLoader';
import FundsBarChart from './Partials/FundsBarChart';
import FundsBarChartLoading from './Partials/FundsBarChartLoading';
import FundsList from './Partials/FundsList';
import FundData = App.DataTransferObjects.FundData;
import { useUserSetting } from '@/Hooks/useUserSettings';
import { userSettingEnums } from '@/enums/user-setting-enums';

interface HomePageProps extends Record<string, unknown> {
    funds: FundData[];
}

export default function Index({
    funds,
    proposalsCountByYear,
    chartSummary,
}: PageProps<
    HomePageProps & {
        chartSummary: any;
        proposalsCountByYear: Record<string, number>;
    }
>) {
    const { t } = useTranslation();

    const chartDataByFund = funds
        .map((fund) => ({
            fund: fund.title,
            'Unfunded Proposals': fund?.unfunded_proposals_count,
            'Funded Proposals': fund.funded_proposals_count,
            'Completed Proposals': fund.completed_proposals_count,
        }))
        .reverse();

    const { value: viewByPreference, setValue: setViewByPreference } =
        useUserSetting<string[]>(userSettingEnums.VIEW_CHART_BY, ['fund']);

    const viewBy: 'fund' | 'year' =
        viewByPreference?.[0] === 'year' ? 'year' : 'fund';
    const chartData = viewBy === 'fund' ? chartDataByFund : proposalsCountByYear;

     const handleViewByChange = (value: string | null) => {
        const newValue = value as 'fund' | 'year';
        setViewByPreference([newValue]);
    };

    return (
        <>
            <Head title="Funds" />

            <header data-testid="funds-header">
                <div className="container">
                    <Title>{t('funds.funds')}</Title>
                </div>
                <div className="container">
                    <p className="text-content">{t('funds.subtitle')}</p>
                </div>
            </header>

            <div className="relative flex w-full flex-col justify-center gap-8">
                <section className="container py-8" data-testid="funds-bar-chart-section">
                    <WhenVisible
                        fallback={<FundsBarChartLoading />}
                        data="funds"
                    >
                        <FundsBarChart
                            funds={chartData}
                            fundRounds={funds.length}
                            totalProposals={chartSummary.totalProposals}
                            fundedProposals={chartSummary.fundedProposals}
                            totalFundsRequested={
                                chartSummary.totalFundsAwardedAda
                            }
                            totalFundsAllocated={
                                chartSummary.totalFundsAwardedUsd
                            }
                            viewBy={viewBy}
                            onViewByChange={handleViewByChange}
                        />
                    </WhenVisible>
                </section>
                <section className="container py-8" data-testid="funds-list-section">
                    <WhenVisible fallback={<FundCardLoader />} data="funds">
                        <FundsList funds={funds} />
                    </WhenVisible>
                </section>
            </div>
        </>
    );
}
