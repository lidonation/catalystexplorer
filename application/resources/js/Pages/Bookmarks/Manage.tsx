import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { ReviewList } from '@/Components/ReviewList';
import { BookmarkProvider } from '@/Context/BookmarkContext';
import { SearchParams } from '@/types/search-params';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import CommunitiesList from '../Communities/Partials/CommunitiesList';
import GroupPaginatedList from '../Groups/Partials/GroupPaginatedList';
import ProposalPaginatedList from '../Proposals/Partials/ProposalPaginatedList';
import BookmarkModelSearch from './Partials/BookmarkModelSearch';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import CommunityData = App.DataTransferObjects.CommunityData;
import ProposalData = App.DataTransferObjects.ProposalData;
import GroupData = App.DataTransferObjects.GroupData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;

import { FiltersProvider } from '@/Context/FiltersContext';
import { PaginatedData } from '@/types/paginated-data';
import IdeascaleProfilePaginatedList from '../IdeascaleProfile/Partials/IdeascaleProfilePaginatedList';

type BookmarkCollectionListProps =
    | {
          type: 'proposals';
          proposals: PaginatedData<ProposalData[]>;
          bookmarkCollection: BookmarkCollectionData;
          filters: SearchParams;
      }
    | {
          type: 'communities';
          communities: PaginatedData<CommunityData[]>;
          bookmarkCollection: BookmarkCollectionData;
          filters: SearchParams;
      }
    | {
          type: 'groups';
          groups: PaginatedData<GroupData[]>;
          bookmarkCollection: BookmarkCollectionData;
          filters: SearchParams;
      }
    | {
          type: 'ideascaleProfiles';
          ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
          bookmarkCollection: BookmarkCollectionData;
          filters: SearchParams;
      }
    | {
          type: 'reviews';
          reviews: PaginatedData<ReviewData[]>;
          bookmarkCollection: BookmarkCollectionData;
          filters: SearchParams;
      };

const Manage = (props: BookmarkCollectionListProps) => {
    const { type, bookmarkCollection } = props;
    const { t } = useTranslation();

    const setActiveTab = (val: string) => {
        const route = generateLocalizedRoute('lists.manage', {
            bookmarkCollection: bookmarkCollection.hash,
            type: val,
        });

        router.get(route);
    };

    const component = (() => {
        switch (type) {
            case 'proposals':
                return (
                    <ProposalPaginatedList
                        proposals={props.proposals}
                        isHorizontal={false}
                        isMini={false}
                    />
                );
            case 'communities':
                return <CommunitiesList communities={props.communities} />;
            case 'groups':
                return <GroupPaginatedList groups={props.groups} />;
            case 'ideascaleProfiles':
                return (
                    <IdeascaleProfilePaginatedList
                        ideascaleProfiles={props.ideascaleProfiles}
                    />
                );
            case 'reviews':
                return <ReviewList reviews={props.reviews} />;
            default:
                return null;
        }
    })();

    return (
        <div>
            <Head title={t('bookmarks.listTitle')} />

            <header className="container flex items-start">
                <div className="py-2">
                    <Title level="1">{t('bookmarks.listTitle')}</Title>
                    <div className="text-content">
                        {t('bookmarks.listSubtitle')}
                    </div>
                </div>
                <div className="ml-auto">
                    <PrimaryLink
                        className="px-3 py-3"
                        href={useLocalizedRoute('workflows.bookmarks.index', {
                            step: 1,
                        })}
                    >
                        {`+ ${t('bookmarks.createList')}`}
                    </PrimaryLink>
                </div>
            </header>

            <BookmarkProvider
                bookmarkCollection={bookmarkCollection.hash ?? ''}
                preselected={[{}]}
            >
                <div className="relative">
                    {/* Sticky or fixed header with padding */}
                    <div className="sticky top-0 left-0 z-50 w-full">
                        <div className="container py-4">
                            <BookmarkModelSearch
                                activeTab={type}
                                handleTabchange={setActiveTab}
                            />
                        </div>
                    </div>

                    <FiltersProvider
                        defaultFilters={props.filters}
                        routerOptions={{ only: [type] }}
                    >
                        <div className="mx-auto mt-8">{component}</div>
                    </FiltersProvider>
                </div>
            </BookmarkProvider>
        </div>
    );
};

export default Manage;
