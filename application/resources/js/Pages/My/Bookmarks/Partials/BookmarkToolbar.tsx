import { useLaravelReactI18n } from 'laravel-react-i18n';
import BookmarkSearchControls from './BookmarkSearchControls';

const BookmarkToolbar = () => {
    const { t } = useLaravelReactI18n();

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-2">
                <div className="w-full">
                    <BookmarkSearchControls />
                </div>
            </div>
        </div>
    );
};

export default BookmarkToolbar;
