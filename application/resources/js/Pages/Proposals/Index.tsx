import ProposalCardLoading from '@/Pages/Proposals/Partials/ProposalCardLoading';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedProposals } from '../../../types/paginated-proposals';
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import ProposalFilters from './Partials/ProposalFilters';
import Paginator from '@/Components/Paginator'

interface HomePageProps extends Record<string, unknown> {
    proposals: PaginatedProposals;
    filters: ProposalSearchParams;
}

export default function Index({
    proposals,
    filters,
}: PageProps<HomePageProps>) {
    const { t } = useTranslation();
    let paginationData = {};

    useEffect(() => {
        if (proposals) {
            paginationData = Object.fromEntries(Object.entries(proposals).filter(([key])=>key!='data'));
        }
    }, [proposals]);

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
                <Paginator pagination={paginationData} />
            </section>
        </>
    );
}
