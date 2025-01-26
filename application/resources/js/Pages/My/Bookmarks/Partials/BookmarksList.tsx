import React from 'react';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import ProposalCard from '@/Pages/Proposals/Partials/ProposalCard';
import IdeascaleProfileCard from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileCard';

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
                return filteredItems.map((proposal, index) => (
                    proposal && (
                        <ProposalCard 
                            key={`proposal-${index}`} 
                            proposal={proposal}
                            isHorizontal={false}
                            globalQuickPitchView={false}
                        />
                    )
                ));
            case 'people':
                filteredItems = filterItems(people);
                return filteredItems.map((profile, index) => (
                    <IdeascaleProfileCard 
                        key={`profile-${index}`} 
                        ideascaleProfile={profile}
                    />
                ));
            case 'groups':
                filteredItems = filterItems(groups);
                return filteredItems.map((group, index) => (
                    <div key={`group-${index}`} className="bg-background p-4 rounded-xl">
                        {group.name}
                    </div>
                ));
            case 'reviews':
                filteredItems = filterItems(reviews);
                return filteredItems.map((review, index) => (
                    <div key={`review-${index}`} className="bg-background p-4 rounded-xl">
                        {review.title}
                    </div>
                ));
            default:
                return null;
        }
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
