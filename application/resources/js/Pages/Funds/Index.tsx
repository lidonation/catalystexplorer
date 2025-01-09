import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import FundsBarChart from './Partials/FundsBarChart';
import FundsBarChartLoading from './Partials/FundsBarChartLoading';
import FundCardLoader from './Partials/FundCardLoader';
import FundsList from './Partials/FundsList';
import { PageProps } from '@/types';
import FundData = App.DataTransferObjects.FundData;

interface HomePageProps extends Record<string, unknown> {
    funds: FundData[];
}

export default function Index({
    funds,
    chartSummary,
}: PageProps<HomePageProps & { chartSummary: any }>) {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Funds" />

            <header>
                <div className="container">
                    <h1 className="title-1">{t('funds.funds')}</h1>
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
                            funds={funds}
                            fundRounds={chartSummary.fundRounds}
                            totalProposals={chartSummary.totalProposals}
                            fundedProposals={chartSummary.fundedProposals}
                            totalFundsRequested={chartSummary.totalFundsRequested}
                            totalFundsAllocated={chartSummary.totalFundsAllocated}
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
