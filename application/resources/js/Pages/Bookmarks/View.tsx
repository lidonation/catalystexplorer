import Title from '@/Components/atoms/Title';
import Comments from '@/Components/Comments';
import { ReviewList } from '@/Components/ReviewList';
import { BookmarkProvider } from '@/Context/BookmarkContext';
import { FiltersProvider } from '@/Context/FiltersContext';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import CommunitiesPaginatedList from '../Communities/Partials/CommunitiesPaginatedList';
import GroupPaginatedList from '../Groups/Partials/GroupPaginatedList';
import IdeascaleProfilePaginatedList from '../IdeascaleProfile/Partials/IdeascaleProfilePaginatedList';
import ProposalPaginatedList from '../Proposals/Partials/ProposalPaginatedList';
import BookmarkModelSearch from './Partials/BookmarkModelSearch';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import CommunityData = App.DataTransferObjects.CommunityData;
import ProposalData = App.DataTransferObjects.ProposalData;
import GroupData = App.DataTransferObjects.GroupData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;

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

const View = (props: BookmarkCollectionListProps) => {
    const { type, bookmarkCollection } = props;
    const { t } = useTranslation();

    const setActiveTab = (val: typeof type) => {
        const route = generateLocalizedRoute('lists.view', {
            bookmarkCollection: bookmarkCollection.hash,
            type: val,
        });
        router.visit(route);
    };
    const { auth } = usePage().props;

    const user = bookmarkCollection?.author;

    const isAuthor = auth?.user?.hash == user?.hash;

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
                return (
                    <CommunitiesPaginatedList communities={props.communities} />
                );
            case 'groups':
                return <GroupPaginatedList groups={props.groups} />;
            case 'ideascaleProfiles':
                return (
                    <IdeascaleProfilePaginatedList
                        ideascaleProfiles={props.ideascaleProfiles}
                    />
                );
            case 'reviews':
                return (
                    <ReviewList className="container" reviews={props.reviews} />
                );
            default:
                return null;
        }
    })();

    const preselected = () => {
        switch (props.type) {
            case 'proposals':
                return {
                    proposals: props.proposals.data.map((item) => item.hash),
                };
            case 'communities':
                return {
                    communities: props.communities.data.map(
                        (item) => item.hash,
                    ),
                };
            case 'groups':
                return { groups: props.groups.data.map((item) => item.hash) };
            case 'ideascaleProfiles':
                return {
                    ideascaleProfiles: props.ideascaleProfiles.data.map(
                        (item) => item.hash,
                    ),
                };
            case 'reviews':
                return { reviews: props.reviews.data.map((item) => item.hash) };
            default:
                return [{}];
        }
    };

    return (
        <div>
            <Head title={t('bookmarks.listTitle')} />

            <header className="container mt-4 flex items-start lg:mt-6">
                <div className="">
                    <Title level="1">{bookmarkCollection.title ?? ''}</Title>
                    <p className="text-content">
                        {bookmarkCollection.content ?? ''}
                        {isAuthor && (
                            <Link
                                href={generateLocalizedRoute('lists.manage', {
                                    bookmarkCollection: bookmarkCollection.hash,
                                    type: 'proposals',
                                })}
                                className="text-primary px-4"
                            >
                                {t('bookmarks.manage')}
                            </Link>
                        )}
                    </p>
                </div>
            </header>

            <BookmarkProvider
                bookmarkCollection={bookmarkCollection}
                preselected={
                    preselected() as unknown as Record<string, string[]>
                }
            >
                {/* Sticky or fixed header with padding */}
                <div className="w-full">
                    <div className="container pt-4 lg:relative">
                        <BookmarkModelSearch
                            search={false}
                            activeTab={type}
                            handleTabchange={(e) =>
                                setActiveTab(e as typeof type)
                            }
                        />
                    </div>
                </div>

                <FiltersProvider
                    defaultFilters={props.filters}
                    routerOptions={{ only: [type] }}
                >
                    <div className="mx-auto">{component}</div>
                </FiltersProvider>
            </BookmarkProvider>

            {/* comments */}

            {!!bookmarkCollection.allow_comments && (
                <div className="container mb-8">
                    <Comments
                        commentableType={'BookmarkCollection'}
                        commentableHash={bookmarkCollection.hash ?? ''}
                    />
                </div>
            )}
        </div>
    );
};

export default View;
