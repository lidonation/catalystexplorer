import { useTranslation } from 'react-i18next';
import BookmarkSearchControls from './BookmarkSearchControls';

const BookmarkToolbar = () => {
    const { t } = useTranslation();

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-2">
                <div className='w-full'>
                    <BookmarkSearchControls/>
                </div>
            </div>
        </div>
    );
};

export default BookmarkToolbar;
