import React from 'react';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import ProposalCard from '@/Pages/Proposals/Partials/ProposalCard';
import IdeascaleProfileCard from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileCard';
import { useTranslation } from 'react-i18next';

interface BookmarksListProps {
    proposals?: any[];
    people?: any[];
    groups?: any[];
    reviews?: any[];
    activeType: string | null;
}

const BookmarksList: React.FC<BookmarksListProps> = ({
    proposals = [],
    people = [],
    groups = [],
    reviews = [],
    activeType
}) => {
    const { t } = useTranslation();
    const { getFilter } = useFilterContext();
    const searchQuery = getFilter(ProposalParamsEnum.QUERY) || '';

    const filterItems = (items: any[]) => {
        if (!searchQuery) return items;

        return items.filter(item => {
            if (!item) return false;

            const searchableFields = {
                'proposals': ['title', 'description', 'challenge'],
                'people': ['name', 'email'],
                'groups': ['name', 'description'],
                'reviews': ['title', 'content']
            };

            const fields = searchableFields[activeType as keyof typeof searchableFields] || [];

            return fields.some(field =>
                item[field]?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    };

    const renderItems = () => {
        let filteredItems: any[] = [];

        switch (activeType) {
            case 'proposals':
                filteredItems = filterItems(proposals.filter(p => p != null));
                return filteredItems.length > 0
                    ? filteredItems.map((proposal, index) => (
                        proposal && (
                            <ProposalCard
                                key={`proposal-${index}`}
                                proposal={proposal}
                                isHorizontal={false}
                                globalQuickPitchView={false}
                            />
                        )
                    ))
                    : renderEmptyState();
            case 'people':
                filteredItems = filterItems(people);
                return filteredItems.length > 0
                    ? filteredItems.map((profile, index) => (
                        <IdeascaleProfileCard
                            key={`profile-${index}`}
                            ideascaleProfile={profile}
                        />
                    ))
                    : renderEmptyState();
            case 'groups':
                filteredItems = filterItems(groups);
                return filteredItems.length > 0
                    ? filteredItems.map((group, index) => (
                        <div key={`group-${index}`} className="bg-background p-4 rounded-xl">
                            {group?.name}
                        </div>
                    ))
                    : renderEmptyState();
            case 'reviews':
                filteredItems = filterItems(reviews);
                return filteredItems.length > 0
                    ? filteredItems.map((review, index) => (
                        <div key={`review-${index}`} className="bg-background p-4 rounded-xl">
                            {review.title}
                        </div>
                    ))
                    : renderEmptyState();
            default:
                return null;
        }
    };

    const renderEmptyState = () => {
        const emptyStateMessages = {
            'proposals': t('noProposalBookmarks'),
            'people': t('noPeopleBookmarks'),
            'groups': t('noGroupBookmarks'),
            'reviews': t('noReviewBookmarks')
        };

        const message = emptyStateMessages[activeType as keyof typeof emptyStateMessages] || t('No bookmarks found');

        return (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <p className="text-xl font-semibold text-gray-600">{message}</p>
                {searchQuery && (
                    <p className="text-sm text-gray-500 mt-2">
                        {t('searchQuery')}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${
            activeType === 'proposals'
                ? 'lg:grid-cols-3'
                : 'lg:grid-cols-5'
        } gap-4`}>
            {renderItems()}
        </div>
    );
};

export default BookmarksList;
