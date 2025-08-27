import Title from '@/Components/atoms/Title';
import Comments from '@/Components/Comments';
import { ReviewList } from '@/Components/ReviewList';
import UserAvatar from '@/Components/UserAvatar';
import { BookmarkProvider } from '@/Context/BookmarkContext';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { formatTimestamp } from '@/utils/timeStamp';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Clock, MessageCircle } from 'lucide-react';
import {useLaravelReactI18n} from "laravel-react-i18n";
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
import SearchBar from '@/Components/SearchBar';
import Paragraph from '@/Components/atoms/Paragraph';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useState } from 'react';

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

const BookmarkContent = (props: BookmarkCollectionListProps) => {
    const { type, bookmarkCollection } = props;
    const { t } = useLaravelReactI18n();

    const { getFilter, setFilters, filters } = useFilterContext();

    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(ParamsEnum.QUERY) || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    const handleSearch = (search: string) => {
        setSearchQuery(search);

        const currentUrl = new URL(window.location.href);
        const newParams = new URLSearchParams(currentUrl.search);

        if (search.trim() === '') {
            newParams.delete(ParamsEnum.QUERY);
        } else {
            newParams.set(ParamsEnum.QUERY, search);
        }

        newParams.delete('p');

        const baseUrl = currentUrl.pathname;
        const queryString = newParams.toString();
        const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

        router.visit(fullUrl, {
            preserveState: false,
            preserveScroll: false,
            only: [type, 'bookmarkCollection'],
        });
    };

    const setActiveTab = (val: typeof type) => {
        const route = generateLocalizedRoute('lists.view', {
            bookmarkCollection: bookmarkCollection.id,
            type: val,
        });

        const currentUrl = new URL(window.location.href);
        const searchParam = currentUrl.searchParams.get(ParamsEnum.QUERY);

        if (searchParam) {
            const newUrl = new URL(route, window.location.origin);
            newUrl.searchParams.set(ParamsEnum.QUERY, searchParam);
            router.visit(newUrl.toString());
        } else {
            router.visit(route);
        }
    };
    const { auth } = usePage().props;

    const user = bookmarkCollection?.author;

    const isAuthor = auth?.user?.id == user?.id;

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
                    <CommunitiesPaginatedList
                        communities={props.communities}
                        cardType="mini"
                        gridCols="grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-4"
                    />
                );
            case 'groups':
                return (
                    <GroupPaginatedList
                        groups={props.groups}
                        cardType="mini"
                        gridCols="grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-4 auto-rows-fr"
                    />
                );
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

    return (
        <>
            <div className="container w-full py-4 lg:relative">
                {isAuthor && (
                    <div className="top-6 right-8 z-50 ml-auto flex justify-end gap-4 lg:absolute">
                        <Link
                            href={generateLocalizedRoute('lists.manage', {
                                bookmarkCollection: bookmarkCollection.id,
                                type: 'proposals',
                            })}
                            className="text-primary  text-sm text-nowrap"
                        >
                            {t('bookmarks.manage')}
                        </Link>
                    </div>
                )}
                <BookmarkModelSearch
                    search={false}
                    activeTab={type}
                    handleTabchange={(e) => setActiveTab(e as typeof type)}
                    searchQuery={searchQuery}
                    typesCounts={bookmarkCollection?.types_count}
                />
                <SearchBar
                    border={'border-dark-light'}
                    handleSearch={handleSearch}
                    autoFocus
                    showRingOnFocus
                    initialSearch={searchQuery}
                    placeholder={t('workflows.bookmarks.placeholder')}
                />
                <Paragraph className='mt-4'>{t('workflows.bookmarks.text')}</Paragraph>
            </div>
            <div className="mx-auto">{component}</div>
        </>
    );
};

const View = (props: BookmarkCollectionListProps) => {
    const { type, bookmarkCollection } = props;
    const { t } = useLaravelReactI18n();

    const preselected = () => {
        switch (props.type) {
            case 'proposals':
                return {
                    proposals: props.proposals.data.map((item) => item.id),
                };
            case 'communities':
                return {
                    communities: props.communities.data.map(
                        (item) => item.id,
                    ),
                };
            case 'groups':
                return { groups: props.groups.data.map((item) => item.id) };
            case 'ideascaleProfiles':
                return {
                    ideascaleProfiles: props.ideascaleProfiles.data.map(
                        (item) => item.id,
                    ),
                };
            case 'reviews':
                return { reviews: props.reviews.data.map((item) => item.id) };
            default:
                return [{}];
        }
    };

    return (
        <div>
            <Head title={t('bookmarks.listTitle')} />

            <header className="container mt-4 flex flex-col items-start lg:mt-6">
                <div className="flex flex-col">
                    <Title level="1">{bookmarkCollection.title ?? ''}</Title>
                    <p className="text-content">
                        {bookmarkCollection.content ?? ''}
                    </p>
                </div>
                <div className="flex w-full flex-row items-center gap-4 py-2 lg:gap-6">
                    <div className="flex items-center gap-2">
                        <UserAvatar
                            size="size-6"
                            imageUrl={
                                bookmarkCollection?.author?.hero_img_url
                                    ? bookmarkCollection.author?.hero_img_url
                                    : undefined
                            }
                            name={
                                bookmarkCollection?.author?.name ?? 'Anonymous'
                            }
                        />

                        <span className="lg:text-md text-xs font-semibold">
                            {bookmarkCollection?.author?.name}
                        </span>
                    </div>

                    {bookmarkCollection?.updated_at && (
                        <div className="text-muted-foreground lg:text-md flex items-center gap-2 text-xs">
                            <Clock className="hidden h-5 w-5 lg:block" />
                            <span className="font-semibold">
                                {t('bookmarks.lastModified')}:{' '}
                            </span>
                            <span>
                                {formatTimestamp(
                                    bookmarkCollection?.updated_at,
                                )}
                            </span>
                        </div>
                    )}

                    <div className="text-muted-foreground lg:text-md flex flex-row items-center gap-2 text-xs">
                        <a
                            className="text-primary flex gap-2 font-semibold"
                            href={'#comment-section'}
                        >
                            <MessageCircle className="text-primary hidden h-5 w-5 lg:block" />
                            <span>{t('bookmarks.comments')}: </span>
                        </a>
                        <span>{bookmarkCollection?.comments_count ?? 0}</span>
                    </div>
                </div>
            </header>

            <BookmarkProvider
                bookmarkCollection={bookmarkCollection}
                preselected={
                    preselected() as unknown as Record<string, string[]>
                }
            >
                <FiltersProvider
                    defaultFilters={props.filters}
                    routerOptions={{ only: [type] }}
                >
                    <BookmarkContent {...props} />
                </FiltersProvider>
            </BookmarkProvider>

            {/* comments */}
            {!!bookmarkCollection.allow_comments && (
                <div className="container mb-8" id="comment-section">
                    <Comments
                        commentableType={'BookmarkCollection'}
                        commentableHash={bookmarkCollection.id ?? ''}
                    />
                </div>
            )}
        </div>
    );
};

export default View;
