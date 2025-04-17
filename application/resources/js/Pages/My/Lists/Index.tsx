import MyLayout from '@/Pages/My/MyLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../../types/paginated-data';
import BookmarkCollectionCard from './Partials/BookmarkCollectionCard';
import CreateListButton from './Partials/CreateListButton';
import BookmarkPage2 from './Partials/ListCreateFromBookmarkSave/Step2';
import BookmarkPage3 from './Partials/ListCreateFromBookmarkSave/Step3';
import Paginator from '@/Components/Paginator';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;

interface MyListProps {
    bookmarkCollections: PaginatedData<BookmarkCollectionData[]>;
}

export default function MyList({ bookmarkCollections }: MyListProps) {
    const [showCreate, setShowCreate] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        console.log('bookmarkCollections', bookmarkCollections);
    }, []);

    const handleCreateClick = () => {
        setShowCreate(true);
    };

    const pages = [
        <BookmarkPage2 key="priority" />,
        <BookmarkPage3 key="new-list" />,
    ];

    return (
        <MyLayout>
            <Head title="My List" />

            <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
                {bookmarkCollections?.data &&
                    bookmarkCollections?.data?.length > 0 && (
                        <div className="mb-6 flex items-center">
                            <div className="ml-auto">
                                <CreateListButton />
                            </div>
                        </div>
                    )}

                {bookmarkCollections?.data &&
                bookmarkCollections?.data?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {bookmarkCollections?.data.map((collection) => (
                            <BookmarkCollectionCard
                                key={collection.hash}
                                collection={collection}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <CreateListButton variant="large" />
                    </div>
                )}
            </div>
            {bookmarkCollections && bookmarkCollections.total > 0 && (
                <section className="container w-full mt-8">
                    <Paginator pagination={bookmarkCollections} />
                </section>
            )}
        </MyLayout>
    );
}
