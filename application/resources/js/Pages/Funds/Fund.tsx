import Selector from '@/Components/Select';
import { MetricEnum } from '@/enums/metrics-enums';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CampaignList from '../Campaign/Partials/CampaignList';
import MetricCardList from '../Metrics/Partials/MetricsCardList';
import FundData = App.DataTransferObjects.FundData;
import MetricData = App.DataTransferObjects.MetricData;
import CampaignData = App.DataTransferObjects.CampaignData;

interface FundPageProps extends Record<string, unknown> {
    fund: FundData;
    metrics: MetricData[];
    campaigns: CampaignData[];
}
export default function Fund({
    fund,
    metrics,
    campaigns,
}: PageProps<FundPageProps>) {
    const { t } = useTranslation();

    const sortingOptions = [
        { label: t('funds.options.lowToHigh'), value: 'amount:asc' },
        { label: t('funds.options.highToLow'), value: 'amount:desc' },
        {
            label: t('funds.options.proposalCountsLowToHigh'),
            value: 'proposal_count:asc',
        },
        {
            label: t('funds.options.proposalCountsHighToLow'),
            value: 'proposal_count:desc',
        },
    ];

    const [filters, setFilters] = useState<string[]>(
        sortingOptions.map((sortingOption) => sortingOption.value),
    );
    const handleFilterChange = (selectedItems: string[]) => {
        setFilters(selectedItems);
    };

    return (
        <>
            <Head title={fund.title} />

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
                    <MetricCardList
                        metrics={metrics}
                        sortBy={MetricEnum.ORDER}
                        sortOrder={MetricEnum.DESCENDING}
                        columns={MetricEnum.THREE_COLUMNS}
                    />
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
                        <div className="mt-4 flex justify-end lg:pb-8 ml-4 pb-1">
                            <Selector
                                isMultiselect={false}
                                options={sortingOptions}
                                setSelectedItems={handleFilterChange}
                                selectedItems={filters}
                                hideCheckbox={true}
                                placeholder={t('funds.sortBy')}
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <CampaignList campaigns={campaigns} fund={fund} />
                    </div>
                </section>
            </div>
        </>
    );
}
