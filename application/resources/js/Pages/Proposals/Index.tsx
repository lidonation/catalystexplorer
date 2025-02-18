import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ListProvider } from '@/Context/ListContext';
import { useMetrics } from '@/Context/MetricsContext';
import { usePlayer } from '@/Context/PlayerContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import VerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import { PageProps } from '@/types';
import { ProposalMetrics } from '@/types/proposal-metrics';
import { Head, WhenVisible } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { SearchParams } from '../../../types/search-params';
import CardLayoutSwitcher from './Partials/CardLayoutSwitcher';
import FundFiltersContainer from './Partials/FundFiltersContainer';
import ProposalFilters from './Partials/ProposalFilters';
import ProposalHorizontalCardLoading from './Partials/ProposalHorizontalCardLoading';
import ProposalSortingOptions from '@/lib/ProposalSortOptions';
import ProposalData = App.DataTransferObjects.ProposalData;
import Title from '@/Components/atoms/Title';
import SearchControls from '@/Components/atoms/SearchControls';

interface HomePageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    funds: any;
    filters: SearchParams;
    metrics: ProposalMetrics;
}

export default function Index({
    proposals,
    funds,
    filters,
    metrics,
}: PageProps<HomePageProps>) {
    const { t } = useTranslation();

    const { createProposalPlaylist } = usePlayer();
    const { setMetrics } = useMetrics();

    const [isHorizontal, setIsHorizontal] = useState(false);
    const [isMini, setIsMini] = useState(false)
    const [showFilters, setShowFilters] = useState(false);

    const [quickPitchView, setQuickPitchView] = useState(
        !!parseInt(filters[ParamsEnum.QUICK_PITCHES]),
    );

    useEffect(() => {
        if (proposals && proposals.data?.length && quickPitchView) {
            createProposalPlaylist(proposals?.data);
        }
    }, [proposals, quickPitchView]);

    useEffect(() => {
        if (metrics) {
            setMetrics(metrics);
        }

        return () => {
            setMetrics(undefined);
        };
    }, [metrics]);


    return (
        <ListProvider>
            <FiltersProvider defaultFilters={filters} routerOptions={{ only: ['proposals', 'metrics'] }}>
                <Head title="Proposals" />

                <header>
                    <div className="container">
                        <Title level='1'>{t('proposals.proposals')}</Title>
                    </div>

                    <div className="container">
                        <p className="text-content">
                            {t('proposals.pageSubtitle')}
                        </p>
                    </div>
                </header>

                <section className="container">
                    <FundFiltersContainer funds={funds} />
                </section>

                <SearchControls onFiltersToggle={setShowFilters} sortOptions={ProposalSortingOptions()}/>

                <section
                    className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                        showFilters ? 'max-h-[500px]' : 'max-h-0'
                    }`}
                >
                    <ProposalFilters />
                </section>

                <section className="container flex flex-col items-end pt-2 pb-1">
                    <CardLayoutSwitcher
                        isHorizontal={isHorizontal}
                        quickPitchView={quickPitchView}
                        isMini={isMini}
                        setIsMini={setIsMini}
                        setIsHorizontal={setIsHorizontal}
                        setGlobalQuickPitchView={setQuickPitchView}
                    />
                </section>

                <section className="proposals-wrapper container mt-3 w-full pb-8">
                    <WhenVisible
                        fallback={
                            isHorizontal ? (
                                <ProposalHorizontalCardLoading />
                            ) : (
                                <VerticalCardLoading />
                            )
                        }
                        data="proposals"
                    >
                        <div className="py-4">
                            <ProposalResults
                                proposals={proposals?.data}
                                isHorizontal={isHorizontal}
                                quickPitchView={quickPitchView}
                                setGlobalQuickPitchView={setQuickPitchView}
                                isMini={isMini}
                            />
                        </div>
                    </WhenVisible>
                </section>

                <section className="w-full px-4 lg:container lg:px-0">
                    {proposals && <Paginator pagination={proposals} />}
                </section>
            </FiltersProvider>
        </ListProvider>
    );
}
