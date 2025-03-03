import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import FundsBarChart from './Partials/FundsBarChart';
import FundsBarChartLoading from './Partials/FundsBarChartLoading';
import FundCardLoader from './Partials/FundCardLoader';
import FundsList from './Partials/FundsList';
import { PageProps } from '@/types';
import FundData = App.DataTransferObjects.FundData;
import Title from '@/Components/atoms/Title';

interface HomePageProps extends Record<string, unknown> {
    funds: FundData[];
}

export default function Index({
    funds,
    chartSummary
}: PageProps<HomePageProps & { chartSummary: any }>) {
    const { t } = useTranslation();

    const chartData = funds
    .map(fund => ({
        fund: fund.title,
        "Total Proposals": fund.proposals_count,
        "Funded Proposals": fund.funded_proposals_count,
        "Completed Proposals": fund.completed_proposals_count
    }))
    .sort((a, b) => {
        const numA = parseInt(a.fund.replace(/\D/g, ''), 10);
        const numB = parseInt(b.fund.replace(/\D/g, ''), 10);
        return numA - numB;  
    });

    return (
        <>
            <Head title="Funds" />

            <header>
                <div className="container">
                    <Title>{t('funds.funds')}</Title>
                </div>
                <div className="container">
                    <p className="text-content">{t('funds.subtitle')}</p>
                </div>
            </header>

            <div className="relative flex w-full flex-col justify-center gap-8">
                <section className="container py-8">
                    <WhenVisible
                        fallback={<FundsBarChartLoading />}
                        data="funds"
                    >
                        <FundsBarChart
                            funds={chartData}
                            fundRounds={funds.length}
                            totalProposals={chartSummary.totalProposals}
                            fundedProposals={chartSummary.fundedProposals}
                            totalFundsRequested={chartSummary.totalFundsAwardedAda}
                            totalFundsAllocated={chartSummary.totalFundsAwardedUsd}
                        />
                    </WhenVisible>
                </section>
                <section className="container py-8">
                    <WhenVisible fallback={<FundCardLoader />} data="funds">
                        <FundsList funds={funds} />
                    </WhenVisible>
                </section>
            </div>
        </>
    );
}
