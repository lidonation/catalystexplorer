import IdeaScaleProfileLoader from '@/Pages/IdeascaleProfile/Partials/IdeaScaleProfileLoader';
import ProposalVerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import { WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface SearchResultsLoadingProps {
    type: string;
    count?: number;
}

const SearchResultsLoading = ({
    type,
    count = 1,
}: SearchResultsLoadingProps) => {
    const { t } = useLaravelReactI18n();
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
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
                        <WhenVisible
                            data="ideascaleProfiles"
                            fallback={<IdeaScaleProfileLoader count={count} />}
                        >
                            <></>
                        </WhenVisible>
                    </div>
                );
            case 'reviews':
                return (
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                        {Array(count || 2)
                            .fill(0)
                            .map((_, index) => (
                                <div
                                    key={index}
                                    className="w-full animate-pulse space-y-3 rounded-lg border p-4"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-gray-persist h-10 w-10 rounded-full" />
                                        <div className="bg-gray-persist h-4 w-1/3 rounded-sm" />
                                    </div>
                                    <div className="mt-2 flex space-x-2">
                                        <div className="bg-gray-persist h-3 w-16 rounded-sm" />
                                        <div className="bg-gray-persist h-3 w-16 rounded-sm" />
                                    </div>
                                    <div className="bg-gray-persist mt-2 h-3 w-full rounded-sm" />
                                    <div className="bg-gray-persist mt-1 h-3 w-4/5 rounded-sm" />
                                </div>
                            ))}
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
                            <div className="bg-gray-persist h-10 w-10 rounded-sm" />
                            <div className="bg-gray-persist h-4 w-1/3 rounded-sm" />
                        </div>
                        <div className="bg-gray-persist h-3 w-2/3 rounded-sm" />
                        <div className="flex space-x-2">
                            <div className="bg-gray-persist h-3 w-16 rounded-sm" />
                            <div className="bg-gray-persist h-3 w-16 rounded-sm" />
                        </div>
                    </div>
                );

            // ... rest of the cases remain the same
        }
    };

    return <div className="w-full space-y-4 py-3">{renderSkeletonItem()}</div>;
};

export default SearchResultsLoading;
