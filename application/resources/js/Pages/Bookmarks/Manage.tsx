import Button from '@/Components/atoms/Button';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Title from '@/Components/atoms/Title';
import Comments from '@/Components/Comments';
import ModalSidebar from '@/Components/layout/ModalSidebar';
import { ReviewList } from '@/Components/ReviewList';
import { BookmarkProvider } from '@/Context/BookmarkContext';
import { FiltersProvider } from '@/Context/FiltersContext';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import EventBus from '@/utils/eventBus';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommunitiesPaginatedList from '../Communities/Partials/CommunitiesPaginatedList';
import GroupPaginatedList from '../Groups/Partials/GroupPaginatedList';
import IdeascaleProfilePaginatedList from '../IdeascaleProfile/Partials/IdeascaleProfilePaginatedList';
import ProposalPaginatedList from '../Proposals/Partials/ProposalPaginatedList';
import BookmarkModelSearch from './Partials/BookmarkModelSearch';
import EditListForm, { ListForm } from './Partials/EditListForm';
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

const Manage = (props: BookmarkCollectionListProps) => {
    const { type, bookmarkCollection } = props;
    const { t } = useTranslation();
    const [activeTab, setTab] = useState(type);

    const setActiveTab = (val: typeof type) => {
        const route = generateLocalizedRoute('lists.manage', {
            bookmarkCollection: bookmarkCollection.hash,
            type: val,
        });
        router.visit(route);
    };

    useEffect(() => {
        EventBus.on('listItem-removed', () => setActiveTab(activeTab));
    }, []);

    const [activeEditModal, setActiveEditModal] = useState<boolean>(false);
    const [activeConfirm, setActiveConfirm] = useState<boolean>(false);

    const handleUpdate = (form: ListForm) => {
        form.post(
            route('api.collections.update', {
                bookmarkCollection: bookmarkCollection.hash,
            }),
            {
                onSuccess: () => setActiveTab(activeTab),
            },
        );
    };

    const handleDelete = () => {
        setActiveConfirm(true);
        router.post(
            route('api.collections.delete', {
                bookmarkCollection: bookmarkCollection.hash,
            }),
            {},
            {
                onSuccess: () =>
                    router.get(generateLocalizedRoute('my.list.index')),
            },
        );
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
                        {t(bookmarkCollection.content ?? '')}
                        <Link
                            href={generateLocalizedRoute('lists.view', {
                                bookmarkCollection: bookmarkCollection.hash,
                                type: 'proposals',
                            })}
                            className="text-primary px-4"
                        >
                            {t('bookmarks.viewPublic')}
                        </Link>
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
                    <div className="container py-4 lg:relative">
                        <Button
                            className="bg-primary text-content-light right-6 z-50 mt-4 mr-2 ml-auto rounded-sm px-4 py-2 hover:cursor-pointer lg:absolute lg:top-0 lg:px-6"
                            onClick={() => setActiveEditModal(true)}
                        >
                            {`${t('bookmarks.listSetting')}`}
                        </Button>
                        <BookmarkModelSearch
                            activeTab={activeTab}
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
                    <div className="mx-auto my-8">{component}</div>
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

            {/* modals */}
            <ModalSidebar
                title={t('bookmarks.editList')}
                isOpen={!!activeEditModal}
                onClose={() => setActiveEditModal(false)}
                logo={false}
            >
                <EditListForm
                    bookmarkCollection={bookmarkCollection}
                    handleSave={handleUpdate}
                    handleDelete={() => setActiveConfirm(true)}
                />
            </ModalSidebar>

            <ModalSidebar
                title={t('bookmarks.editList')}
                isOpen={!!activeConfirm}
                onClose={() => setActiveConfirm(false)}
                logo={false}
                centered
            >
                <div className="flex flex-col gap-4 p-4 text-center">
                    <Title level="5">{t('bookmarks.confirmDelete')}</Title>
                    <p>{t('bookmarks.permanentDelete')}</p>
                    <div className="flex justify-between gap-4">
                        <PrimaryButton
                            onClick={() => setActiveConfirm(false)}
                            className="bg-primary flex-1 font-semibold"
                        >
                            {t('Cancel')}
                        </PrimaryButton>
                        <Button
                            onClick={handleDelete}
                            className="bg-danger-mid text-content-light flex-1 rounded-md py-1.5 font-semibold"
                        >
                            {t('bookmarks.deletesList')}
                        </Button>
                    </div>
                </div>
            </ModalSidebar>
        </div>
    );
};

export default Manage;
