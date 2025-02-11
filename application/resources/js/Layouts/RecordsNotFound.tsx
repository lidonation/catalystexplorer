import RecordsNotFoundIcon from '@/Components/svgs/RecordsNotFoundIcon';
import { useTranslation } from 'react-i18next';

type RecordsNotFoundProps = {
    context?: 'proposals' | 'profiles' | 'groups' | 'reviews' | 'bookmarks' | 'search';
    searchTerm?: string;
};

export default function RecordsNotFound({
    context = 'search',
    searchTerm = ''
}: RecordsNotFoundProps) {
    const { t } = useTranslation();


    const getMessage = () => {
        return t(`recordsNotFound.message`);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full py-16 px-4 bg-background rounded-lg">
            <RecordsNotFoundIcon />
            <p className="mt-2 text-base text-gray-600 text-center max-w-md">
                {getMessage()}
            </p>
        </div>
    );
}