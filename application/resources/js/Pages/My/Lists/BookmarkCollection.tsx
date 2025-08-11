import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import BookmarkCollectionData =  App.DataTransferObjects.BookmarkCollectionData;

interface BookmarkCollectionProps{
    bookmarkCollection : BookmarkCollectionData
}

const BookmarkCollection = ({bookmarkCollection}: BookmarkCollectionProps) => {
    const { t } = useLaravelReactI18n();

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
