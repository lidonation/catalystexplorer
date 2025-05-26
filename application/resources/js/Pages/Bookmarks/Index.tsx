import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import { PaginatedData } from '@/types/paginated-data';
import { Head, WhenVisible } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchParams } from '@/types/search-params';
import BookmarkCollectionList from '../My/Lists/Partials/BookmarkCollectionList';
import BookmarkCollectionListLoader from '../My/Lists/Partials/BookmarkCollectionListLoader';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import Paginator from '@/Components/Paginator';
import ListSortingOptions from '@/lib/ListSortOptions';

interface BookmarkCollectionListProps {
    bookmarkCollections: PaginatedData<BookmarkCollectionData[]>;
    filters: SearchParams;
}
const Index: React.FC<BookmarkCollectionListProps> = ({
    bookmarkCollections,
    filters,
}) => {
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = useState(false);

    return (
        <>
            <FiltersProvider
                defaultFilters={filters}
                routerOptions={{ only: ['bookmarkCollections'] }}
            >
                <Head title="Community Lists" />

                <header>
                    <div className="container py-2">
                        <Title level="1">{t('groups.title')}</Title>

                        <div className="text-content">
                            {t('groups.subtitle')}
                        </div>
                    </div>
                </header>

                <section className="container">
                    <SearchControls
                        withFilters={false}
                        onFiltersToggle={setShowFilters}
                        sortOptions={ListSortingOptions()}
                        searchPlaceholder={t('bookmarks.searchPlaceholder')}
                    />
                </section>

                <section className="container py-8">
                    <WhenVisible
                        fallback={<BookmarkCollectionListLoader />}
                        data="bookmarkCollections"
                    >
                        <BookmarkCollectionList
                            bookmarkCollections={
                                bookmarkCollections?.data || []
                            }
                        />
                    </WhenVisible>
                </section>

                <section className="container">
                    {bookmarkCollections && (
                        <Paginator pagination={bookmarkCollections} />
                    )}
                </section>
            </FiltersProvider>
        </>
    );
};

export default Index;
