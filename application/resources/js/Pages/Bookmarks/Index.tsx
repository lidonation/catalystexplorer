import PrimaryLink from '@/Components/atoms/PrimaryLink';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ListSortingOptions from '@/lib/ListSortOptions';
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

                <header className="container mt-4 flex flex-col items-start lg:relative lg:mt-6">
                    <div className="">
                        <Title className="" level="1">
                            {t('bookmarks.listTitle')}
                        </Title>

                        <div className="text-content">
                            {t('bookmarks.listSubtitle')}
                        </div>
                    </div>

                    <PrimaryLink
                        className="lg:text-md mt-2 ml-auto px-4 py-2 text-sm text-nowrap lg:absolute lg:top-0 lg:right-0 lg:right-6 lg:px-6"
                        href={useLocalizedRoute('workflows.bookmarks.index', {
                            step: 1,
                        })}
                    >
                        {`+ ${t('bookmarks.createList')}`}
                    </PrimaryLink>
                </header>

                <section className="container">
                    <SearchControls
                        withFilters={false}
                        onFiltersToggle={setShowFilters}
                        sortOptions={ListSortingOptions()}
                        searchPlaceholder={t('bookmarks.searchPlaceholder')}
                    />
                </section>

                {bookmarkCollections?.data &&
                bookmarkCollections?.data.length ? (
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

                        <div className="lg:mt-8 mt-4">
                            <Paginator pagination={bookmarkCollections} />
                        </div>
                    </section>
                ) : (
                    <div className="p-8 text-center">
                        <RecordsNotFound />
                        <p>{t(`recordsNotFound.message`)}</p>
                    </div>
                )}
            </FiltersProvider>
        </>
    );
};

export default Index;
