import RecordsNotFoundIcon from '@/Components/svgs/RecordsNotFoundIcon';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Paragraph from '@/Components/atoms/Paragraph.tsx';

type RecordsNotFoundProps = {
    context?:
        | 'proposals'
        | 'profiles'
        | 'groups'
        | 'reviews'
        | 'bookmarks'
        | 'search'
        | 'communities'
        | 'connections'
        | 'projectSchedules';
    searchTerm?: string;
    showIcon?: boolean;
};

export default function RecordsNotFound({
    context = 'search',
    searchTerm = '',
    showIcon = true,
}: RecordsNotFoundProps) {
    const { t } = useLaravelReactI18n();

    const getMessage = () => {
        return t(`recordsNotFound.message`);
    };

    return (
        <div
            className="bg-background flex w-full flex-col items-center justify-center rounded-lg px-4 py-8"
            data-testid={`records-not-found-${context}`}
        >
            {showIcon && <RecordsNotFoundIcon />}
            <Paragraph className="mt-2 max-w-md text-center text-base text-gray-600">
                {getMessage()}
            </Paragraph>
        </div>
    );
}
