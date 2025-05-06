import Paginator from '@/Components/Paginator';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import MyLayout from '@/Pages/My/MyLayout';
import ProposalTable from '@/Pages/Proposals/Partials/ProposalTable';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../../types/paginated-data';
import { SearchParams } from '../../../../types/search-params';
import MyProposalFilters from './partials/MyProposalsFilters';
import SearchControls from './partials/MyProposalsSearchControls';
import ProposalData = App.DataTransferObjects.ProposalData;

interface MyProposalsProps {
    proposals: PaginatedData<ProposalData[]>;
    filters: SearchParams;
}

export default function MyProposals({ proposals, filters }: MyProposalsProps) {
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = useState(false);

    return (
        <MyLayout filters={filters}>
            <Head title={t('my.proposals')} />

            <div className="bg-background mx-6 rounded-xl px-4 py-8 shadow-sm sm:px-6 lg:px-8">
                <div>
                    <SearchControls
                        onFiltersToggle={setShowFilters}
                        searchPlaceholder={t('vote.search')}
                    />
                    {showFilters && (
                        <MyProposalFilters/>
                           
                    )}
                </div>
                {proposals.data && proposals.data.length > 0 ? (
                    <div className="mt-4">
                        <ProposalTable proposals={proposals.data} />
                        <div className="mt-8">
                            {proposals?.data && proposals?.data.length > 8 && (
                                <Paginator pagination={proposals} />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <RecordsNotFound />
                    </div>
                )}
            </div>
        </MyLayout>
    );
}
