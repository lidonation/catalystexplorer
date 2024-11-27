import Paginator from '@/Components/Paginator';
import ProposalCardLoading from '@/Pages/Proposals/Partials/ProposalCardLoading';
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

            <section className="proposals-wrapper container w-full">
                <WhenVisible
                    fallback={<ProposalCardLoading />}
                    data="proposals"
                >
                    <div className="py-4">
                        <ProposalResults proposals={proposals?.data} />
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
