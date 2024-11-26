import ProposalCardLoading from '@/Pages/Proposals/Partials/ProposalCardLoading';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ProposalFilters from './Partials/ProposalFilters';
import ProposalData = App.DataTransferObjects.ProposalData;
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/Components/Pagination';
import Paginator from '@/Components/Paginator';

interface HomePageProps extends Record<string, unknown> {
    proposals: ProposalData[];
}

export default function Index({ proposals }: PageProps<HomePageProps>) {
    const { t } = useTranslation();
     const paginationData = {
         current_page: 1,
         first_page_url: '/?p=1',
         from: 1,
         last_page: 6,
         last_page_url: '/?p=6',
         links: [
             { url: null, label: '&laquo; Previous', active: false },
             { url: '/?p=1', label: '1', active: true },
             { url: '/?p=2', label: '2', active: false },
             { url: '/?p=3', label: '3', active: false },
             { url: '/?p=4', label: '4', active: false },
             { url: '/?p=5', label: '5', active: false },
             { url: '/?p=6', label: '6', active: false },
             { url: '/?p=2', label: 'Next &raquo;', active: false },
         ],
         next_page_url: '/?p=2',
         path: '/',
         per_page: 20,
         prev_page_url: null,
         to: 20,
         total: 101,
     };
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
                <ProposalFilters />
            </section>

            <section className="proposals-wrapper container w-full">
                <WhenVisible
                    fallback={<ProposalCardLoading />}
                    data="proposals"
                >
                    <div className="py-4">
                        <ProposalResults proposals={proposals} />
                    </div>
                </WhenVisible>
            </section>

            <section className="container w-full">
                <Paginator pagination={paginationData} />
            </section>
        </>
    );
}
