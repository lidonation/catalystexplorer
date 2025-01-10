import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import { UIProvider } from '@/Context/SharedUIContext';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import VerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import { ProposalMetrics } from '@/types/proposal-metrics';
import CardLayoutSwitcher from './Partials/CardLayoutSwitcher';
import MetricsBar from './Partials/MetricsBar';
import PlayerBar from './Partials/PlayerBar';
import ProposalFilters from './Partials/ProposalFilters';
import HorizontaCardLoading from './Partials/ProposalHorizontalCardLoading';
import ProposalData = App.DataTransferObjects.ProposalData;
import FundFiltersContainer from './Partials/FundFiltersContainer';
import ProposalSearchControls from './Partials/ProposalSearchControls';

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

    useEffect(() => {}, [currentPage, perPage]);

    const [isHorizontal, setIsHorizontal] = useState(false);

    const [quickPitchView, setQuickPitchView] = useState(false);

    const setGlobalQuickPitchView = (value: boolean) =>
        setQuickPitchView(value);


    return (
        <FiltersProvider defaultFilters={filters}>
            <Head title="Proposals" />

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
                <FundFiltersContainer funds={funds}/>
            </section>

            <ProposalSearchControls/>

            <section className="container flex w-full flex-col items-center justify-center">
                <ProposalFilters/>
            </section>

            <section className="container mt-4 flex flex-col items-end">
                <CardLayoutSwitcher
                    isHorizontal={isHorizontal}
                    quickPitchView={quickPitchView}
                    setIsHorizontal={setIsHorizontal}
                    setGlobalQuickPitchView={setGlobalQuickPitchView}
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
                            quickPitchView={quickPitchView}
                            setGlobalQuickPitchView={setGlobalQuickPitchView}
                        />
                    </div>
                </WhenVisible>
            </section>

            <section className="w-full px-4 lg:container lg:px-0">
                {proposals && (
                    <Paginator
                        pagination={proposals}
                        setPerPage={setPerPage}
                        setCurrentPage={setCurrentPage}
                    />
                )}
            </section>

            <UIProvider>
                <section className="sticky inset-x-0 bottom-0 mx-auto flex items-center justify-center pb-4">
                    <div className="pr-2">
                        <MetricsBar {...metrics} />
                    </div>
                    <div>
                        <PlayerBar />
                    </div>
                </section>
            </UIProvider>
        </FiltersProvider>
    );
}
