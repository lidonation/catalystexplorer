import ProposalVerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import { useTranslation } from 'react-i18next';

interface SearchResultsLoadingProps {
    type: string;
    count?: number;
}

const SearchResultsLoading = ({
    type,
    count = 3,
}: SearchResultsLoadingProps) => {
    const { t } = useTranslation();

    const getTranslatedType = (type: string) => {
        return t(`searchResults.tabs.${type.toLowerCase()}`);
    };

    const renderSkeletonItem = () => {
        const translatedType = getTranslatedType(type);

        switch (type.toLowerCase()) {
            case 'proposals':
                return <ProposalVerticalCardLoading />;

            case 'ideascaleprofiles':
                return (
                    <div
                        className="flex w-full animate-pulse items-center space-x-4 rounded-lg border p-4"
                        aria-label={`${translatedType} ${t('loading')}`}
                    >
                        <div className="h-12 w-12 rounded-full bg-gray-persist" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 rounded bg-gray-persist" />
                            <div className="h-3 w-1/2 rounded bg-gray-persist" />
                        </div>
                    </div>
                );

            case 'articles':
            case 'communities':
            case 'groups':
                return (
                    <div
                        className="w-full animate-pulse space-y-3 rounded-lg border p-4"
                        aria-label={`${translatedType} ${t('loading')}`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded bg-gray-persist" />
                            <div className="h-4 w-1/3 rounded bg-gray-persist" />
                        </div>
                        <div className="h-3 w-2/3 rounded bg-gray-persist" />
                        <div className="flex space-x-2">
                            <div className="h-3 w-16 rounded bg-gray-persist" />
                            <div className="h-3 w-16 rounded bg-gray-persist" />
                        </div>
                    </div>
                );

            case 'reviews':
                return (
                    <div
                        className="w-full animate-pulse space-y-3 rounded-lg border p-4"
                        aria-label={`${translatedType} ${t('loading')}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-1/4 rounded bg-gray-persist" />
                            <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-4 w-4 rounded bg-gray-persist"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-full rounded bg-gray-persist" />
                            <div className="h-4 w-2/3 rounded bg-gray-persist" />
                        </div>
                    </div>
                );

            default:
                return (
                    <div
                        className="w-full animate-pulse space-y-3 rounded-lg border p-4"
                        aria-label={`${translatedType} ${t('loading')}`}
                    >
                        <div className="h-4 w-1/3 rounded bg-gray-persist" />
                        <div className="h-4 w-full rounded bg-gray-persist" />
                        <div className="h-4 w-2/3 rounded bg-gray-persist" />
                    </div>
                );
        }
    };

    return (
        <div className="w-full space-y-4 py-3">
            {[...Array(count)].map((_, index) => (
                <div key={index}>{renderSkeletonItem()}</div>
            ))}
        </div>
    );
};

export default SearchResultsLoading;
