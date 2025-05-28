import Paginator from '@/Components/Paginator';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '@/types/paginated-data';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head, WhenVisible } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BookmarkCollectionList from './Partials/BookmarkCollectionList';
import BookmarkCollectionListLoader from './Partials/BookmarkCollectionListLoader';
import BookmarkPage2 from './Partials/ListCreateFromBookmarkSave/Step2';
import BookmarkPage3 from './Partials/ListCreateFromBookmarkSave/Step3';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;


interface MyListProps {
    bookmarkCollections: PaginatedData<BookmarkCollectionData[]>;
}

export default function MyList({ bookmarkCollections }: MyListProps) {
    const { t } = useTranslation();

    return (
        <>
            <Head title="My List" />

            <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center">
                    <div className="m-auto mt-8">
                        <PrimaryLink
                            href={useLocalizedRoute(
                                'workflows.bookmarks.index',
                                { step: 1 },
                            )}
                        >
                            {`+ ${t('my.createList')}`}
                        </PrimaryLink>
                    </div>
                </div>

                {bookmarkCollections?.data &&
                bookmarkCollections?.data?.length > 0 ? (
                    <WhenVisible
                        fallback={<BookmarkCollectionListLoader />}
                        data="groups"
                    >
                        <BookmarkCollectionList
                            bookmarkCollections={
                                bookmarkCollections.data||[]
                            }
                        />
                    </WhenVisible>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <RecordsNotFound />
                    </div>
                )}
            </div>
        </>
    );
}
