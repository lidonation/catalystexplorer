import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ProposalSortingOptions from '@/lib/ProposalSortOptions';
import ProposalTable from '@/Pages/Proposals/Partials/ProposalTable';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MyProposalFilters from './partials/MyProposalsFilters';
import ProposalData = App.DataTransferObjects.ProposalData;

interface MyProposalsProps {
    proposals: PaginatedData<ProposalData[]>;
    filters: SearchParams;
}

export default function MyProposals({ proposals, filters }: MyProposalsProps) {
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = useState(false);

    return (
        <FiltersProvider
            defaultFilters={filters || []}
            routerOptions={{ only: ['proposals'] }}
        >
            <Head title={t('my.proposals')} />

            <div className="pt-8 pb-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-background overflow-hidden bg-white p-6 shadow-md sm:rounded-lg">
                        <div className="border-background-lighter mb-4 w-full border-b">
                            <Title level="4" className="mb-4 font-bold">
                                {t('my.proposals')}
                            </Title>
                        </div>

                        <section className="mb-4 w-full">
                            <SearchControls
                                withActiveTags={false}
                                sortOptions={ProposalSortingOptions()}
                                onFiltersToggle={setShowFilters}
                                searchPlaceholder={t('searchBar.placeholder')}
                            />
                        </section>

                        <section
                            className={`flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                                showFilters ? 'max-h-[500px]' : 'max-h-0'
                            }`}
                        >
                            <MyProposalFilters />
                        </section>

                        <div className="border-background-lighter overflow-hidden rounded-lg border">
                            {proposals?.data && proposals?.data?.length > 0 ? (
                                <div>
                                    <ProposalTable
                                        proposals={proposals?.data}
                                    />
                                    <div className="mt-4 flex w-full items-center justify-center">
                                        <Paginator pagination={proposals} />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <RecordsNotFound />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </FiltersProvider>
    );
}
