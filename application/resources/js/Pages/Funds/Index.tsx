import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import FundsBarChart from './Partials/FundsBarChart';
import FundsBarChartLoading from './Partials/FundsBarChartLoading';

export default function () {
    const { t } = useTranslation();
    const funds = [
        {
            fund: 'Fund 13',
            'Total Proposals': 1350,
            'Funded Proposals': 200,
            'Completed Proposals': 50,
        },
        {
            fund: 'Fund 12',
            'Total Proposals': 1100,
            'Funded Proposals': 350,
            'Completed Proposals': 150,
        },
        {
            fund: 'Fund 11',
            'Total Proposals': 900,
            'Funded Proposals': 200,
            'Completed Proposals': 50,
        },
        {
            fund: 'Fund 10',
            'Total Proposals': 1300,
            'Funded Proposals': 200,
            'Completed Proposals': 50,
        },
        {
            fund: 'Fund 9',
            'Total Proposals': 1050,
            'Funded Proposals': 200,
            'Completed Proposals': 50,
        },
        {
            fund: 'Fund 8',
            'Total Proposals': 1000,
            'Funded Proposals': 200,
            'Completed Proposals': 50,
        },
        {
            fund: 'Fund 7',
            'Total Proposals': 800,
            'Funded Proposals': 200,
            'Completed Proposals': 50,
        },
        {
            fund: 'Fund 6',
            'Total Proposals': 600,
            'Funded Proposals': 200,
            'Completed Proposals': 50,
        },
        {
            fund: 'Fund 5',
            'Total Proposals': 250,
            'Funded Proposals': 200,
            'Completed Proposals': 50,
        },
        {
            fund: 'Fund 4',
            'Total Proposals': 200,
            'Funded Proposals': 200,
            'Completed Proposals': 50,
        },
        {
            fund: 'Fund 3',
            'Total Proposals': 150,
            'Funded Proposals': 200,
            'Completed Proposals': 50,
        },
    ];

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

            <div className="flex h-screen w-full flex-col items-center">
                <section className="container py-8">
                    <WhenVisible
                        fallback={<FundsBarChartLoading />}
                        data="funds"
                    >
                        <FundsBarChart
                            funds={funds}
                            fundRounds={13}
                            totalProposals={9851}
                            fundedProposals={1212}
                            totalFundsRequested={'15.67M $'}
                            totalFundsAllocated={'6.67M $'}
                        />
                    </WhenVisible>
                </section>
            </div>
        </>
    );
}
