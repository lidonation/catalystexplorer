import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import IdeascaleProfileCardMini from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileCardMini';
import ProposalCard from '@/Pages/Proposals/Partials/ProposalCard';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';

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
    activeType,
}) => {
    const { t } = useLaravelReactI18n();
    const { getFilter } = useFilterContext();
    const searchQuery = getFilter(ParamsEnum.QUERY) || '';

    const filterItems = (items: any[]) => {
        if (!searchQuery) return items;
        return items.filter((item) => {
            if (!item) return false;
            const searchableFields = {
                proposals: ['title', 'description', 'challenge'],
                people: ['name', 'email'],
                groups: ['name', 'description'],
                reviews: ['title', 'content'],
            };
            const fields =
                searchableFields[activeType as keyof typeof searchableFields] ||
                [];
            return fields.some((field) =>
                item[field]?.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        });
    };

    const renderNotFound = (context: string) => (
        <div className="col-span-full flex min-h-[200px] items-center justify-center">
            <RecordsNotFound
                // context={context}
                searchTerm={searchQuery}
            />
        </div>
    );

    const renderItems = () => {
        let filteredItems: any[] = [];
        switch (activeType) {
            case 'proposals':
                filteredItems = filterItems(proposals.filter((p) => p != null));
                return filteredItems.length > 0
                    ? filteredItems.map(
                          (proposal, index) =>
                              proposal && (
                                  <ProposalCard
                                      key={`proposal-${index}`}
                                      proposal={proposal}
                                      isHorizontal={false}
                                      globalQuickPitchView={false}
                                  />
                              ),
                      )
                    : renderNotFound('proposals');
            case 'people':
                filteredItems = filterItems(people);
                return filteredItems.length > 0
                    ? filteredItems.map((profile, index) => (
                          <IdeascaleProfileCardMini
                              key={`profile-${index}`}
                              ideascaleProfile={profile}
                          />
                      ))
                    : renderNotFound('profiles');
            case 'groups':
                filteredItems = filterItems(groups);
                return filteredItems.length > 0
                    ? filteredItems.map((group, index) => (
                          <div
                              key={`group-${index}`}
                              className="bg-background rounded-xl p-4"
                          >
                              {group?.name}
                          </div>
                      ))
                    : renderNotFound('groups');
            case 'reviews':
                filteredItems = filterItems(reviews);
                return filteredItems.length > 0
                    ? filteredItems.map((review, index) => (
                          <div
                              key={`review-${index}`}
                              className="bg-background rounded-xl p-4"
                          >
                              {review.title}
                          </div>
                      ))
                    : renderNotFound('reviews');
            default:
                return null;
        }
    };

    return (
        <div
            className={`grid grid-cols-1 md:grid-cols-2 ${
                activeType === 'proposals' ? 'lg:grid-cols-3' : 'lg:grid-cols-5'
            } gap-4`}
        >
            {renderItems()}
        </div>
    );
};

export default BookmarksList;
