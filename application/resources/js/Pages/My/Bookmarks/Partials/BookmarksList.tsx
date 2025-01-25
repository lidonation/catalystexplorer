import React from 'react';
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
    const renderItems = () => {
        switch (activeType) {
            case 'proposals':
                return proposals.filter(p => p).map((proposal, index) => (
                    <ProposalCard 
                        key={`proposal-${index}`} 
                        proposal={proposal}
                        isHorizontal={false}
                        globalQuickPitchView={false}
                    />
                ));
            case 'people':
                return people.map((profile, index) => (
                    <IdeascaleProfileCard 
                        key={`profile-${index}`} 
                        ideascaleProfile={profile} 
                    />
                ));
            case 'groups':
                return groups.map((group, index) => (
                    <div key={`group-${index}`} className="bg-background p-4 rounded-xl">
                        {group.name}
                    </div>
                ));
            case 'reviews':
                return reviews.map((review, index) => (
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
