import { FiltersProvider } from '@/Context/FiltersContext';
import { MetricEnum } from '@/enums/metrics-enums';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import CampaignList from '../Campaign/Partials/CampaignList';
import MetricCardLoading from '../Metrics/Partials/MetricCardLoading';
import MetricCardList from '../Metrics/Partials/MetricsCardList';
import FundSortBy from './Partials/FundsSortBy';
import FundData = App.DataTransferObjects.FundData;
import MetricData = App.DataTransferObjects.MetricData;
import CampaignData = App.DataTransferObjects.CampaignData;
import CampaignLoader from '../Campaign/Partials/CampaignLoader';

interface FundPageProps extends Record<string, unknown> {
    fund: FundData;
    metrics: MetricData[];
    campaigns: CampaignData[];
    filters: ProposalSearchParams;
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

            <FiltersProvider defaultFilters={filters}>
                <div className="relative flex w-full flex-col justify-center gap-8">
                    {/* Hero Image */}
                    <section className="container py-8">
                        <div className="relative flex h-60 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-gray-100 to-gray-900">
                            <img
                                src={fund.hero_img_url}
                                alt={fund.title || 'Fund'}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="absolute left-14 top-48 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-8 border-background-lighter bg-gradient-to-r from-gray-100 to-gray-900 shadow-sm sm:h-32 sm:w-32 lg:h-36 lg:w-36">
                            <img
                                src={fund.hero_img_url}
                                alt={fund.title || 'Fund'}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </section>

                    <section className="container py-8">
                        <h4 className="title-4">{fund.title}</h4>
                        <p className="text-gray-persist">
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

                    <section className="container py-8">
                        <div className="flex w-full justify-between">
                            <div>
                                <h5 className="title-4">
                                    {t('funds.browseByCampaign')}
                                </h5>
                                <p className="pb-4 text-gray-persist">
                                    {t('funds.browseByCampaignSubtitle')}
                                </p>
                            </div>
                            <FundSortBy />
                        </div>
                        <div className="mt-4">
                           <WhenVisible fallback={<CampaignLoader/>} data="campaigns">
                           <CampaignList campaigns={campaigns} fund={fund} />
                           </WhenVisible>
                        </div>
                    </section>
                </div>
            </FiltersProvider>
        </>
    );
}
