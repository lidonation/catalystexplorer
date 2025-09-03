import PrimaryButton from '@/Components/atoms/PrimaryButton.tsx';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import CreateListPicker from '@/Pages/Bookmarks/Partials/CreateListPicker.tsx';
import { PaginatedData } from '@/types/paginated-data';
import { Head, WhenVisible } from '@inertiajs/react';
import { putConfig } from '@inertiaui/modal-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import BookmarkCollectionList from './Partials/BookmarkCollectionList';
import BookmarkCollectionListLoader from './Partials/BookmarkCollectionListLoader';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;

interface MyListProps {
    bookmarkCollections: PaginatedData<BookmarkCollectionData[]>;
}

export default function MyList({ bookmarkCollections }: MyListProps) {
    const { t } = useLaravelReactI18n();
    const [showListPicker, setPickingList] = useState(false);

    putConfig({
        type: 'modal',
        navigate: false,
    });

    return (
        <>
            <Head title="My List" />

            <div className="flex w-full max-w-full flex-col px-4 py-2 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center">
                    <div className="m-auto mt-8">
                        <PrimaryButton
                            className=""
                            onClick={() => setPickingList(true)}
                            data-testid="create-new-list-button"
                        >
                            {`+ ${t('my.createList')}`}
                        </PrimaryButton>
                    </div>
                </div>

                {bookmarkCollections?.data &&
                bookmarkCollections?.data?.length > 0 ? (
                    <WhenVisible
                        fallback={<BookmarkCollectionListLoader />}
                        data="groups"
                    >
                        <BookmarkCollectionList
                            bookmarkCollections={bookmarkCollections.data || []}
                        />
                    </WhenVisible>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <RecordsNotFound />
                    </div>
                )}

                <CreateListPicker
                    showPickingList={showListPicker}
                    setPickingList={setPickingList}
                    data-testid="create-list-picker"
                />
            </div>
        </>
    );
}
