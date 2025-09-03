import PrimaryButton from '@/Components/atoms/PrimaryButton.tsx';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ListSortingOptions from '@/lib/ListSortOptions';
import CreateListPicker from '@/Pages/Bookmarks/Partials/CreateListPicker.tsx';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
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
    const { t } = useLaravelReactI18n();
    const [showFilters, setShowFilters] = useState(false);
    const [showListPicker, setPickingList] = useState(false);

    return (
        <>
            <FiltersProvider
                defaultFilters={filters}
                routerOptions={{ only: ['bookmarkCollections'] }}
            >
                <Head title="Community Lists" />

                <header className="container mt-4 flex w-full flex-col items-start lg:mt-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="">
                        <Title className="" level="1">
                            {t('bookmarks.listTitle')}
                        </Title>

                        <div className="text-content">
                            {t('bookmarks.listSubtitle')}
                        </div>
                    </div>

                    <PrimaryButton
                        className=""
                        onClick={() => setPickingList(true)}
                    >
                        {`+ ${t('my.createList')}`}
                    </PrimaryButton>
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

                        <div className="mt-4 lg:mt-8">
                            <Paginator pagination={bookmarkCollections} />
                        </div>
                    </section>
                ) : (
                    <div className="p-8 text-center">
                        <RecordsNotFound />
                        <p>{t(`recordsNotFound.message`)}</p>
                    </div>
                )}

                <CreateListPicker
                    showPickingList={showListPicker}
                    setPickingList={setPickingList}
                ></CreateListPicker>
            </FiltersProvider>
        </>
    );
};

export default Index;
