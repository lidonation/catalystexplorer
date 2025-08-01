import Paragraph from '@/Components/atoms/Paragraph';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ListProvider } from '@/Context/ListContext';
import { useMetrics } from '@/Context/MetricsContext';
// import { usePlayer } from '@/Context/PlayerContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import ProposalSortingOptions from '@/lib/ProposalSortOptions';
import { PageProps } from '@/types';
import { PaginatedData } from '@/types/paginated-data';
import { ProposalMetrics } from '@/types/proposal-metrics';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import CardLayoutSwitcher from './Partials/CardLayoutSwitcher';
import FundFiltersContainer from './Partials/FundFiltersContainer';
import ProposalFilters from './Partials/ProposalFilters';
import ProposalPaginatedList from './Partials/ProposalPaginatedList';
import ProposalData = App.DataTransferObjects.ProposalData;
// @ts-ignore

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
    const { t } = useLaravelReactI18n();

    // const { createProposalPlaylist } = usePlayer();
    const { setMetrics } = useMetrics();

    const [isHorizontal, setIsHorizontal] = useState(false);
    const [isMini, setIsMini] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [quickPitchView, setQuickPitchView] = useState(
        !!parseInt(filters[ParamsEnum.QUICK_PITCHES]),
    );

    // useEffect(() => {
    //     if (proposals && proposals.data?.length && quickPitchView) {
    //         createProposalPlaylist(proposals?.data);
    //     }
    // }, [proposals, quickPitchView]);

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
            <FiltersProvider
                defaultFilters={filters}
                routerOptions={{ only: ['proposals', 'metrics', 'funds'] }}
            >
                <Head title={t('proposals.proposals')} />

                <header>
                    <div className="container">
                        <Title level="1" data-testid="proposal-page-title">{t('proposals.proposals')}</Title>
                    </div>

                    <div className="container">
                        <Paragraph className="text-content" data-testid="proposal-page-subtitle">
                            {t('proposals.pageSubtitle')}
                        </Paragraph>
                    </div>
                </header>

                <section className="container">
                    <FundFiltersContainer funds={funds} />
                </section>

                <section className="container">
                    <SearchControls
                        onFiltersToggle={setShowFilters}
                        sortOptions={ProposalSortingOptions()}
                        searchPlaceholder={t('searchBar.placeholder')}
                    />
                </section>

                <section
                    className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                        showFilters ? 'max-h-[500px]' : 'max-h-0'
                    }`}
                    data-testid="proposal-filters-container"
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

                <ProposalPaginatedList
                    proposals={proposals}
                    isHorizontal={isHorizontal}
                    isMini={isMini}
                    quickPitchView={quickPitchView}
                    setQuickPitchView={setQuickPitchView}
                />
            </FiltersProvider>
        </ListProvider>
    );
}
