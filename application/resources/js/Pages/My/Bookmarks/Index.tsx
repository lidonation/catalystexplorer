import { Head } from '@inertiajs/react';
import BookmarkToolbar from './Partials/BookmarkToolbar';
import BookmarkSearchControls from './Partials/BookmarkSearchControls';
import { useTranslation } from 'react-i18next';

const Index = () => {
    const { t } = useTranslation();
    return (
        <>
            <Head title="My Bookmarks"/>

            <header>
                <div className='container'>
                    <h1 className="title-1">My Bookmarks</h1>
                </div>
                <div className='container'>
                    <p className="text-content">
                        {t('bookmark')}
                        <BookmarkToolbar/>
                        <BookmarkSearchControls/>
                    </p>
                </div>
            </header>

            <div className="flex flex-col h-screen w-full items-center justify-center">
                <h1>Coming Soon</h1>
            </div>
        </>
    );
};

export default Index;
