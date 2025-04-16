import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import BookmarkCollectionData =  App.DataTransferObjects.BookmarkCollectionData;

interface BookmarkCollectionProps{
    bookmarkCollection : BookmarkCollectionData
}

const BookmarkCollection = ({bookmarkCollection}: BookmarkCollectionProps) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title={bookmarkCollection?.title}/>

            <header>
                <div className='container'>
                    <Title>{bookmarkCollection?.title}</Title>
                </div>
               
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Title level='2'>{t('comingSoon')}</Title>
            </div>
        </>
    );
};

export default BookmarkCollection;