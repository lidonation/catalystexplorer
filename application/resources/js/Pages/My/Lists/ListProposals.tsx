import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import ListProposalsFilter from './Partials/ListProposalsFilter';
import ListProposalsTable from './Partials/ListProposalsTable';
import ProposalData = App.DataTransferObjects.ProposalData;
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;

interface ListProposalsPageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    bookmarkCollection: BookmarkCollectionData;
    funds: any[];
    fundsCount: Record<string, any>;
    filters: SearchParams;
}

const ListProposals: React.FC<ListProposalsPageProps> = ({
    proposals,
    bookmarkCollection,
    funds,
    fundsCount,
    filters,
}) => {
    const { t } = useLaravelReactI18n();

    return (
        <FiltersProvider
            defaultFilters={filters}
            routerOptions={{ only: ['proposals', 'funds', 'fundsCount'] }}
        >
            <Head title={bookmarkCollection.title || t('my.listProposals')} />

            <header>
                <div className="container">
                    <Title level="1">{bookmarkCollection.title}</Title>
                    <p className="text-content mt-2">
                        {bookmarkCollection.content || t('bookmarks.manageListDescription')}
                    </p>
                </div>
            </header>

            <section className="container">
                <SearchControls
                    onFiltersToggle={() => {}}
                    sortOptions={[]}
                    searchPlaceholder={t('searchBar.searchProposals')}
                    withFilters={false}
                />
            </section>

            {funds && funds.length > 0 && (
                <section className="container">
                    <ListProposalsFilter
                        funds={funds}
                        fundsCount={fundsCount}
                    />
                </section>
            )}

            <div className="flex w-full flex-col items-center justify-center">
                <section className="container">
                    {proposals.data && proposals.data.length > 0 ? (
                        <ListProposalsTable 
                            proposals={proposals} 
                            bookmarkCollection={bookmarkCollection}
                        />
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-lg text-content">
                                {t('bookmarks.noProposalsInList')}
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </FiltersProvider>
    );
};

export default ListProposals;
