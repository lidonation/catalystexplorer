import Paginator from '@/Components/Paginator';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import MyLayout from '@/Pages/My/MyLayout';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../../types/paginated-data';
import BookmarkCollectionCard from './Partials/BookmarkCollectionCard';
import BookmarkPage2 from './Partials/ListCreateFromBookmarkSave/Step2';
import BookmarkPage3 from './Partials/ListCreateFromBookmarkSave/Step3';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;

interface MyListProps {
    bookmarkCollections: PaginatedData<BookmarkCollectionData[]>;
}

export default function MyList({ bookmarkCollections }: MyListProps) {
    const [showCreate, setShowCreate] = useState(false);
    const { t } = useTranslation();

    const handleCreateClick = () => {
        setShowCreate(true);
    };

    const pages = [
        <BookmarkPage2 key="priority" />,
        <BookmarkPage3 key="new-list" />,
    ];

    return (
        <>
            <Head title="My List" />

            <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8 h-screen">
                {bookmarkCollections?.data &&
                    bookmarkCollections?.data?.length > 0 && (
                        <div className="mb-6 flex items-center">
                            <div className="ml-auto">
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
                        <PrimaryLink
                            href={useLocalizedRoute(
                                'workflows.bookmarks.index',
                                { step: 1 },
                            )}
                        />
                    </div>
                )}
            </div>
            {bookmarkCollections && bookmarkCollections.total > 0 && (
                <section className="container mt-8 w-full">
                    <Paginator pagination={bookmarkCollections} />
                </section>
            )}
        </>
    );
}
