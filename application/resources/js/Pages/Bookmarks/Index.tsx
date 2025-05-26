import PrimaryLink from '@/Components/atoms/PrimaryLink';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head, WhenVisible } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BookmarkCollectionList from '../My/Lists/Partials/BookmarkCollectionList';
import BookmarkCollectionListLoader from '../My/Lists/Partials/BookmarkCollectionListLoader';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;

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

                <header className="container flex items-start">
                    <div className="py-2">
                        <Title level="1">{t('bookmarks.listTitle')}</Title>

                        <div className="text-content">
                            {t('bookmarks.listSubtitle')}
                        </div>
                    </div>
                    <div className="ml-auto">
                        <PrimaryLink className='px-3 py-3'
                            href={useLocalizedRoute(
                                'workflows.bookmarks.index',
                                { step: 1 },
                            )}
                        >
                            {`+ ${t('bookmarks.createList')}`}
                        </PrimaryLink>
                    </div>
                </header>

                <section className="container">
                    <SearchControls
                        withFilters={false}
                        onFiltersToggle={setShowFilters}
                        sortOptions={[{}]}
                        searchPlaceholder={t('bookmarks.searchPlaceholder')}
                    />
                </section>

                <section className="container py-8">
                    {bookmarkCollections?.data &&
                    bookmarkCollections?.data.length ? (
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
                    ) : (
                        <div className="p-8 text-center">
                            <RecordsNotFound />
                            <p>{t(`recordsNotFound.message`)}</p>
                        </div>
                    )}
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
