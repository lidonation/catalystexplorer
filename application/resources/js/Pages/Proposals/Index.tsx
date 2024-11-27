import Paginator from '@/Components/Paginator';
import VerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import HorizontaCardLoading from './Partials/ProposalHorizontalCardLoading';
import CardLayoutSwitcher from './Partials/CardLayoutSwitcher';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import ProposalFilters from './Partials/ProposalFilters';
import ProposalData = App.DataTransferObjects.ProposalData;

interface HomePageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    filters: ProposalSearchParams;
}

export default function Index({
    proposals,
    filters,
}: PageProps<HomePageProps>) {
    const { t } = useTranslation();

    const [perPage, setPerPage] = useState<number>(24);
    const [currentPage, setCurrentpage] = useState<number>(1);

    useEffect(() => {
        console.log({ perPage, currentPage });
    }, [currentPage, perPage]);


    const [isHorizontal, setIsHorizontal] = useState(false);

    const [quickPitchView, setQuickPitchView] = useState(false);

    const setGlobalQuickPitchView = (value: boolean) => setQuickPitchView(value);


    return (
        <>
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

            <section className="container flex w-full flex-col items-center justify-center">
                <ProposalFilters filters={filters} />
            </section>

            <section className="container  items-end flex flex-col mt-4">
                <CardLayoutSwitcher
                    isHorizontal={isHorizontal}
                    quickPitchView={quickPitchView}
                    setIsHorizontal={setIsHorizontal}
                    setGlobalQuickPitchView={setGlobalQuickPitchView}
                />
            </section>

            <section className="proposals-wrapper container w-full">
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

            <section className="container w-full">
                {proposals && (
                    <Paginator
                        perPage={perPage}
                        pagination={proposals}
                        setPerPage={setPerPage}
                        setCurrentPage={setCurrentpage}
                    />
                )}
            </section>
        </>
    );
}
