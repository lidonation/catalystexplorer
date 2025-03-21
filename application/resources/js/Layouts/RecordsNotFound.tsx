import RecordsNotFoundIcon from '@/Components/svgs/RecordsNotFoundIcon';
import { useTranslation } from 'react-i18next';

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
        | 'proposalMilestones';
    searchTerm?: string;
    showIcon?: boolean;
};

export default function RecordsNotFound({
    context = 'search',
    searchTerm = '',
    showIcon = true,
}: RecordsNotFoundProps) {
    const { t } = useTranslation();

    const getMessage = () => {
        return t(`recordsNotFound.message`);
    };

    return (
        <div className="bg-background flex w-full flex-col items-center justify-center rounded-lg px-4 py-8">
            {showIcon && <RecordsNotFoundIcon />}
            {/* <p className="mt-2 max-w-md text-center text-base text-gray-600">
                {getMessage()}
            </p> */}
        </div>
    );
}
