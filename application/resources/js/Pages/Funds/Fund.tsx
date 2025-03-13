import { FiltersProvider } from '@/Context/FiltersContext';
import { MetricEnum } from '@/enums/metrics-enums';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { SearchParams } from '../../../types/search-params';
import CampaignList from '../Campaign/Partials/CampaignList';
import CampaignLoader from '../Campaign/Partials/CampaignLoader';
import MetricCardLoading from '../Metrics/Partials/MetricCardLoading';
import MetricCardList from '../Metrics/Partials/MetricsCardList';
import FundSortBy from './Partials/FundsSortBy';
import HeroSection from './Partials/HeroSection';
import FundData = App.DataTransferObjects.FundData;
import MetricData = App.DataTransferObjects.MetricData;
import CampaignData = App.DataTransferObjects.CampaignData;
import CampaignCard from '../Campaign/Partials/CampaignCard';

interface FundPageProps extends Record<string, unknown> {
    fund: FundData;
    metrics: MetricData[];
    campaigns: CampaignData[];
    filters: SearchParams;
}

export default function Fund({
    fund,
    metrics,
    campaigns,
    filters,
}: PageProps<FundPageProps>) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={fund.title} />

            <div className="relative flex w-full flex-col justify-center gap-8">
                {/* Hero Image */}
                <HeroSection fund={fund} />

                <section className="container py-8">
                    <h4 className="title-4">{fund.title}</h4>
                    <p className="text-content opacity-70">
                        {t('funds.singleFundSubtitle')}
                    </p>
                    <WhenVisible
                        fallback={<MetricCardLoading />}
                        data="metrics"
                    >
                        <MetricCardList
                            metrics={metrics}
                            sortBy={MetricEnum.ORDER}
                            sortOrder={MetricEnum.DESCENDING}
                            columns={MetricEnum.THREE_COLUMNS}
                        />
                    </WhenVisible>
                </section>

                <FiltersProvider
                    defaultFilters={filters}
                    routerOptions={{ only: ['campaigns'] }}
                >
                    <section className="container py-8">
                        <div className="flex w-full justify-between">
                            <div>
                                <h5 className="title-4">
                                    {t('funds.browseByCampaign')}
                                </h5>
                                <p className="text-gray-persist pb-4">
                                    {t('funds.browseByCampaignSubtitle')}
                                </p>
                            </div>
                            <FundSortBy />
                        </div>
                        <div className="mt-4">
                            <WhenVisible
                                fallback={<CampaignLoader />}
                                data="campaigns"
                            >
                                <CampaignList campaigns={campaigns}className='grid-cols-3'>
                                    {(campaign) => (
                                        <CampaignCard
                                            key={campaign.hash}
                                            campaign={campaign}
                                            fund={fund}
                                        />
                                    )}
                                </CampaignList>
                            </WhenVisible>
                        </div>
                    </section>
                </FiltersProvider>
            </div>
        </>
    );
}
