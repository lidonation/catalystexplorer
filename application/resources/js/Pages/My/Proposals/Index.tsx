import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ProposalSortingOptions from '@/lib/ProposalSortOptions';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { route } from 'ziggy-js';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useState } from 'react';
import MyProposalFilters from './partials/MyProposalsFilters';
import ProposalTableView from '@/Pages/Proposals/Partials/ProposalTableView';
import ProposalTable, { DynamicColumnConfig } from '@/Pages/Proposals/Partials/ProposalTable';
import { Link } from '@inertiajs/react';
import Paragraph from '@/Components/atoms/Paragraph';
import ProposalData = App.DataTransferObjects.ProposalData;

interface MyProposalsProps {
    proposals: PaginatedData<ProposalData[]>;
    filters: SearchParams;
}

export default function MyProposals({ proposals, filters }: MyProposalsProps) {
    const { t } = useLaravelReactI18n();
    const [showFilters, setShowFilters] = useState(false);

    const myProposalsColumns: (string | DynamicColumnConfig)[] = [
        {
            key: 'title',
            type: 'component' as const,
            component: ({ proposal }: { proposal: ProposalData }) => (
                <div className="w-80" data-testid={`proposal-title-${proposal.id}`}>
                    <Paragraph className="text-md text-content" data-testid={`proposal-title-text-${proposal.id}`}>
                        <Link
                            href={generateLocalizedRoute('my.proposals.manage', { proposal: proposal.id })}
                            className="inline-flex items-center hover:text-primary transition-colors duration-200"
                            data-testid={`manage-proposal-button-${proposal.id}`}
                        >
                            {proposal.title}
                        </Link>
                    </Paragraph>
                </div>
            ),
            sortable: true,
            sortKey: 'title'
        },
    ];

    return (
        <FiltersProvider
            defaultFilters={filters || []}
            routerOptions={{ only: ['proposals'] }}
        >
            <Head title={t('my.proposals')} />

            <div className="container h-full p-6">
                <div className="bg-background flex h-full w-full flex-col overflow-hidden bg-white p-6 shadow-md sm:rounded-lg">
                    <div className="mb-4 w-full flex-shrink-0 border-b border-gray-200">
                        <Title level="4" className="font-semibold">
                            {t('my.proposals')}
                        </Title>
                    </div>

                    <section className="mb-4 w-full flex-shrink-0">
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

                    <ProposalTableView 
                        proposals={proposals}
                        actionType="manage"
                        columns={myProposalsColumns}
                        showPagination={true}
                        disableSorting={false}
                        iconOnlyActions={true}
                        iconActionsConfig={['compare']}
                        protectedColumns={['manageProposal']}
                    />
                </div>
            </div>
        </FiltersProvider>
    );
}
