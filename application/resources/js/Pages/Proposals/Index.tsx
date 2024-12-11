import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import PlayerBar  from './Partials/PlayerBar';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import VerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import CardLayoutSwitcher from './Partials/CardLayoutSwitcher';
import ProposalFilters from './Partials/ProposalFilters';
import HorizontaCardLoading from './Partials/ProposalHorizontalCardLoading';
import FundsFilter from './Partials/FundsFilter';
import ProposalData = App.DataTransferObjects.ProposalData;

interface HomePageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    funds: any,
    filters: ProposalSearchParams;
}

export default function Index({
    proposals,
    funds,
    filters,
}: PageProps<HomePageProps>) {
    const { t } = useTranslation();

    const [perPage, setPerPage] = useState<number>(24);
    const [currentPage, setCurrentpage] = useState<number>(1);

    useEffect(() => { }, [currentPage, perPage]);

    const [isHorizontal, setIsHorizontal] = useState(false);

    const [quickPitchView, setQuickPitchView] = useState(false);

    const setGlobalQuickPitchView = (value: boolean) =>
        setQuickPitchView(value);

    const fundFilters = Object.entries(funds).map(([key, value]) => {
        return { title: key, proposalCount: value };
    })

    const sortedFundFilters = fundFilters.sort((a, b) => {
        const numA = parseInt(a.title.split(" ")[1], 10);
        const numB = parseInt(b.title.split(" ")[1], 10);
        return numB - numA;
    });

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


            <section className="container w-full py-8">
                <ul className='content-gap scrollable snaps-scrollable'>
                    {
                        sortedFundFilters.map((fund, index) => (
                            <li key={index}>
                                <FundsFilter fundTitle={fund.title} totalProposals={fund.proposalCount} />
                            </li>
                        ))
                    }
                </ul>
            </section>

            <section className="container flex w-full flex-col items-center justify-center">
                <ProposalFilters />
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
                        setCurrentPage={setCurrentpage}
                    />
                )}
            </section>
            <section className="sticky bottom-0 inset-x-0 mx-auto pb-4">
                <PlayerBar />
            </section>
        </FiltersProvider>
    );
}
