import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ListProvider } from '@/Context/ListContext';
import { usePlayer } from '@/Context/PlayerContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import VerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import { PageProps } from '@/types';
import { ProposalMetrics } from '@/types/proposal-metrics';
import { Head, WhenVisible } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import CardLayoutSwitcher from './Partials/CardLayoutSwitcher';
import FundFiltersContainer from './Partials/FundFiltersContainer';
import ProposalFilters from './Partials/ProposalFilters';
import HorizontaCardLoading from './Partials/ProposalHorizontalCardLoading';
import ProposalSearchControls from './Partials/ProposalSearchControls';
import ProposalData = App.DataTransferObjects.ProposalData;

interface HomePageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    funds: any;
    filters: ProposalSearchParams;
    metrics: ProposalMetrics;
}

export default function Index({
    proposals,
    funds,
    filters,
    metrics,
}: PageProps<HomePageProps>) {
    const { t } = useTranslation();

    const [perPage, setPerPage] = useState<number>(24);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const { createProposalPlaylist, setMetrics } = usePlayer();

    const [isHorizontal, setIsHorizontal] = useState(false);

    const [quickPitchView, setQuickPitchView] = useState(
        !!parseInt(filters[ProposalParamsEnum.QUICK_PITCHES]),
    );

    // Memoized quick pitch state
    const memoizedQuickPitchView = useMemo(
        () => quickPitchView,
        [quickPitchView],
    );

    useEffect(() => {
        if (proposals?.data?.length && quickPitchView) {
            createProposalPlaylist(proposals.data);
        }
    }, [proposals, quickPitchView, createProposalPlaylist]);

    useEffect(() => {
        if (metrics) {
            setMetrics(metrics);
        }

        return () => {
            setMetrics(undefined);
        };
    }, [metrics, setMetrics]);

    const handleSetPerPage = useCallback(
        (value: number) => setPerPage(value),
        [],
    );
    const handleSetCurrentPage = useCallback(
        (value: number) => setCurrentPage(value),
        [],
    );
    const handleSetQuickPitchView = useCallback(
        (value: boolean) => setQuickPitchView(value),
        [],
    );

    const paginatorMemo = useMemo(
        () =>
            proposals && (
                <Paginator
                    pagination={proposals}
                    setPerPage={handleSetPerPage}
                    setCurrentPage={handleSetCurrentPage}
                />
            ),
        [proposals, handleSetPerPage, handleSetCurrentPage],
    );

    return (
        <ListProvider>
            <FiltersProvider defaultFilters={filters}>
                <Head title={t('proposals.proposals')} />

                <header>
                    <div className="container">
                        <h1 className="title-1">{t('proposals.proposals')}</h1>
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

                <ProposalSearchControls />

                <section className="container flex w-full flex-col items-center justify-center">
                    <ProposalFilters />
                </section>

                <section className="container mt-4 flex flex-col items-end">
                    <CardLayoutSwitcher
                        isHorizontal={isHorizontal}
                        quickPitchView={memoizedQuickPitchView}
                        setIsHorizontal={setIsHorizontal}
                        setGlobalQuickPitchView={handleSetQuickPitchView}
                    />
                </section>

                <section className="proposals-wrapper container mt-3 w-full">
                    <WhenVisible
                        fallback={
                            isHorizontal ? (
                                <HorizontaCardLoading />
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
                                quickPitchView={memoizedQuickPitchView}
                                setGlobalQuickPitchView={
                                    handleSetQuickPitchView
                                }
                            />
                        </div>
                    </WhenVisible>
                </section>

                <section className="w-full px-4 lg:container lg:px-0">
                    {paginatorMemo}
                </section>
            </FiltersProvider>
        </ListProvider>
    );
}
