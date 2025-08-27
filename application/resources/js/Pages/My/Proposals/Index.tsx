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
import {useLaravelReactI18n} from "laravel-react-i18n";
import MyProposalFilters from './partials/MyProposalsFilters';
import ProposalData = App.DataTransferObjects.ProposalData;

interface MyProposalsProps {
    proposals: PaginatedData<ProposalData[]>;
    filters: SearchParams;
}

export default function MyProposals({ proposals, filters }: MyProposalsProps) {
    const { t } = useLaravelReactI18n();
    const [showFilters, setShowFilters] = useState(false);

    return (
        <FiltersProvider
            defaultFilters={filters || []}
            routerOptions={{ only: ['proposals'] }}
        >
            <Head title={t('my.proposals')} />

            <div className="container h-full p-6">
                    <div className="bg-background overflow-hidden bg-white p-6 shadow-md sm:rounded-lg w-full h-full flex flex-col">
                        <div className="border-gray-200 mb-4 w-full border-b flex-shrink-0">
                            <Title level="4" className="font-semibold">
                                {t('my.proposals')}
                            </Title>
                        </div>

                        <section className="mb-4 w-full  flex-shrink-0">
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

                        <div className="border-gray-200 overflow-hidden rounded-lg border">
                            {proposals?.data && proposals?.data?.length > 0 ? (
                                <div>
                                    <ProposalTable
                                        proposals={proposals}
                                    />
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <RecordsNotFound />
                                </div>
                            )}
                        </div>
                    </div>
            </div>
        </FiltersProvider>
    );
}
