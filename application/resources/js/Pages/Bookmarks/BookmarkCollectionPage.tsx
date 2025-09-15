import Button from '@/Components/atoms/Button';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Title from '@/Components/atoms/Title';
import Comments from '@/Components/Comments';
import Modal from '@/Components/layout/Modal.tsx';
import { ReviewList } from '@/Components/ReviewList';
import { BookmarkProvider } from '@/Context/BookmarkContext';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import EventBus from '@/utils/eventBus';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { useWorkflowUrl } from '@/utils/workflowUrls';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import CommunitiesPaginatedList from '../Communities/Partials/CommunitiesPaginatedList';
import GroupPaginatedList from '../Groups/Partials/GroupPaginatedList';
import IdeascaleProfilePaginatedList from '../IdeascaleProfile/Partials/IdeascaleProfilePaginatedList';
import CardLayoutSwitcher from '../Proposals/Partials/CardLayoutSwitcher';
import ProposalPaginatedList from '../Proposals/Partials/ProposalPaginatedList';
import ProposalPdfView from '../Proposals/Partials/ProposalPdfView';
import BookmarkModelSearch from './Partials/BookmarkModelSearch';
import DropdownMenu, { DropdownMenuItem } from './Partials/DropdownMenu';
import EditListForm, { ListForm } from './Partials/EditListForm';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { userSettingEnums } from '@/enums/user-setting-enums';
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

type BookmarkCollectionPageProps = BookmarkCollectionListProps & {
    mode: 'manage' | 'view';
};

const BookmarkCollectionPage = (props: BookmarkCollectionPageProps) => {
    const { type, bookmarkCollection, mode } = props;
    const { t } = useLaravelReactI18n();
    const [activeTab, setTab] = useState(type);

    const setActiveTab = (val: typeof type) => {
        const routeName = mode === 'manage' ? 'my.lists.manage' : 'lists.view';
        const route = generateLocalizedRoute(routeName, {
            bookmarkCollection: bookmarkCollection.id,
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
                bookmarkCollection: bookmarkCollection.id,
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
                bookmarkCollection: bookmarkCollection.id,
            }),
            {},
            {
                onSuccess: () =>
                    router.get(generateLocalizedRoute('my.lists.index')),
            },
        );
    };

    const preselected = () => {
        switch (props.type) {
            case 'proposals':
                return {
                    proposals: props.proposals.data.map((item) => item.id),
                };
            case 'communities':
                return {
                    communities: props.communities.data.map((item) => item.id),
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
                <Title level="1">{bookmarkCollection.title ?? ''}</Title>
                <p className="text-content">
                    {t(bookmarkCollection.content ?? '')}
                </p>
            </header>

            <BookmarkProvider
                bookmarkCollection={bookmarkCollection}
                preselected={
                    preselected() as unknown as Record<string, string[]>
                }
            >
                {/* Sticky or fixed header with padding */}
                <div className="container w-full py-4 lg:relative">
                    <BookmarkModelSearch
                        activeTab={activeTab}
                        handleTabchange={(e) => setActiveTab(e as typeof type)}
                    />
                </div>

                <FiltersProvider
                    defaultFilters={props.filters}
                    routerOptions={{ only: [type] }}
                >
                    <BookmarkCollectionContent {...props} />
                </FiltersProvider>
            </BookmarkProvider>

            {/* comments */}
            {!!bookmarkCollection.allow_comments && (
                <div className="container my-8">
                    <Comments
                        commentableType={'BookmarkCollection'}
                        commentableHash={bookmarkCollection.id ?? ''}
                    />
                </div>
            )}

            {/* modals - only show in manage mode */}
            {mode === 'manage' && (
                <>
                    <Modal
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
                    </Modal>

                    <Modal
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
                    </Modal>
                </>
            )}
        </div>
    );
};

const BookmarkCollectionContent = (props: BookmarkCollectionPageProps) => {
    const { type, bookmarkCollection, mode } = props;
    const { getFilter, setFilters, filters } = useFilterContext();
    const { t } = useLaravelReactI18n();
    const { auth } = usePage().props;
    const user = bookmarkCollection?.author;
    const isAuthor = auth?.user?.id == user?.id;

    // For manage mode, always treat as author. For view mode, check actual authorship
    const showAuthorControls = mode === 'manage' || isAuthor;

    // Simple state for QuickPitch view (not persisted to IndexedDB)
    const [quickPitchView, setQuickPitchView] = useState(
        !!parseInt(getFilter(ParamsEnum.QUICK_PITCHES) || '0')
    );

    // Get view settings from IndexedDB to conditionally render components
    const { value: isPdfView } = useUserSetting<boolean>(userSettingEnums.VIEW_TABLE, false);
    const { value: isHorizontal } = useUserSetting<boolean>(userSettingEnums.VIEW_HORIZONTAL, false);
    const { value: isMini } = useUserSetting<boolean>(userSettingEnums.VIEW_MINI, false);

    const [activeEditModal, setActiveEditModal] = useState<boolean>(false);

    const hasItems = (bookmarkCollection.items_count ?? 0) > 0;
    const isVoterList = bookmarkCollection.list_type === 'voter';
    const isTinderList = bookmarkCollection.list_type === 'tinder';
    const isNormalList = bookmarkCollection.list_type === 'normal';

    const getPublishToIpfsTooltip = () => {
        if (!hasItems && !isVoterList) {
            return t('bookmarks.listMustHaveItemsAndVoter');
        }
        if (!hasItems) {
            return t('bookmarks.listMustHaveItems');
        }
        if (!isVoterList) {
            return t('bookmarks.onlyVoterLists');
        }
        return undefined;
    };

    useEffect(() => {
        console.log('PDF View setting changed:', isPdfView);
    }, [isPdfView]);


    const getDropdownMenuItems = (): DropdownMenuItem[] => {
        const baseItems: DropdownMenuItem[] = [
            {
                label: t('bookmarks.listSetting'),
                type: 'button',
                onClick: () => {
                    setActiveEditModal(true);
                },
                isDefault: true
            }
        ];

        // Add manage-specific items
        if (mode === 'manage') {
            baseItems.push(
                {
                    label: t('workflows.tinderProposal.step4.keepSwiping'),
                    type: 'link' as const,
                    href: isTinderList ? useWorkflowUrl(bookmarkCollection) : '',
                    disabled: !isTinderList,
                    disabledTooltip: !isTinderList ? t('workflows.tinderProposal.onlyTinderLists') : undefined
                },
                {
                    label: t('bookmarks.viewAsPublic'),
                    type: 'link',
                    href: generateLocalizedRoute('lists.view', {
                        bookmarkCollection: bookmarkCollection.id,
                        type: 'proposals',
                    }) || '',
                },
                {
                    label: t('bookmarks.editListItem'),
                    type: 'link' as const,
                    href: ((isVoterList || isNormalList)) ? useWorkflowUrl(bookmarkCollection) : '',
                    disabled: isTinderList,
                    disabledTooltip: isTinderList ? t('workflows.tinderProposal.cannotEditTinderItems') : undefined
                },
                {
                    label: t('bookmarks.publishToIpfs'),
                    type: 'link' as const,
                    href: useLocalizedRoute('workflows.publishToIpfs.index', {
                        step: 1,
                        bookmarkHash: bookmarkCollection.id,
                    }) || '',
                    disabled: !hasItems || !isVoterList,
                    disabledTooltip: getPublishToIpfsTooltip(),
                }
            );
        } else {
            // View mode items (for authors only)
            if (isAuthor) {
                baseItems.push(
                    {
                        label: t('workflows.tinderProposal.step4.keepSwiping'),
                        type: 'link' as const,
                        href: isTinderList ? useWorkflowUrl(bookmarkCollection) : '',
                        disabled: !isTinderList,
                        disabledTooltip: !isTinderList ? t('workflows.tinderProposal.onlyTinderLists') : undefined
                    },
                    {
                        label: t('my.manage'),
                        type: 'link',
                        href: generateLocalizedRoute('my.lists.manage', {
                            bookmarkCollection: bookmarkCollection.id,
                            type: 'proposals',
                        }) || '',
                    },
                    {
                        label: t('bookmarks.editListItem'),
                        type: 'link' as const,
                        href: ((isVoterList || isNormalList)) ? useWorkflowUrl(bookmarkCollection) : '',
                        disabled: isTinderList,
                        disabledTooltip: isTinderList ? t('workflows.tinderProposal.cannotEditTinderItems') : undefined
                    },
                    {
                        label: t('bookmarks.publishToIpfs'),
                        type: 'link' as const,
                        href: useLocalizedRoute('workflows.publishToIpfs.index', {
                            step: 1,
                            bookmarkHash: bookmarkCollection.id,
                        }) || '',
                        disabled: !hasItems || !isVoterList,
                        disabledTooltip: getPublishToIpfsTooltip(),
                    }
                );
            }
        }

        return baseItems;
    };

    useEffect(() => {
        const quickPitchFromFilter = !!parseInt(getFilter(ParamsEnum.QUICK_PITCHES) || '0');
        if (quickPitchFromFilter !== quickPitchView) {
            setQuickPitchView(quickPitchFromFilter);
        }
    }, [filters, quickPitchView]);

    const clearAllFilters = () => {
        setQuickPitchView(false);
    };

    const handleSetQuickPitchView = (value: boolean) => {
        setQuickPitchView(value);
    };

    const component = (() => {
        switch (type) {
            case 'proposals':
                const itemCount = 'data' in props.proposals
                    ? props.proposals.data.length
                    : 0;

                if (isPdfView) {
                    return (
                        <div className="container">
                            <ProposalPdfView
                                proposals={props.proposals}
                                isAuthor={showAuthorControls}
                                listTitle={bookmarkCollection.title ?? 'My List'}
                                onOpenSettings={() => setActiveEditModal(true)}
                            />
                        </div>
                    );
                }
                return (
                    <ProposalPaginatedList
                        proposals={props.proposals as PaginatedData<ProposalData[]>}
                        isHorizontal={isHorizontal ?? false}
                        isMini={isMini ?? false}
                        quickPitchView={quickPitchView}
                        setQuickPitchView={setQuickPitchView}
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
        <div>
            <div className="container mb-4 flex justify-end items-center gap-4">

                {type === 'proposals' && (
                    <CardLayoutSwitcher
                        quickPitchView={quickPitchView}
                        setGlobalQuickPitchView={handleSetQuickPitchView}
                        hideTableView={true}
                        hidePdfView={false}
                        onClearAllFilters={clearAllFilters}
                    />
                )}



                {/* Show dropdown menu based on mode and authorship */}
                {showAuthorControls && (
                    <DropdownMenu
                        items={getDropdownMenuItems()}
                        className="relative"
                        dropdownClassName="bg-background border border-light-gray-persist rounded-lg shadow-lg overflow-visible"
                        matchButtonWidth={true}
                    />
                )}
            </div>

            <div className="mx-auto my-8">{component}</div>

            {/* Edit List Modal */}
            <Modal
                isOpen={activeEditModal}
                title={t('bookmarks.editListItem')}
                onClose={() => setActiveEditModal(false)}
                contentClasses="max-w-lg"
            >
                <EditListForm
                    bookmarkCollection={bookmarkCollection}
                    handleSave={(form: ListForm) => {
                        // Handle form submission
                        form.post(
                            route('api.collections.update', {
                                bookmarkCollection: bookmarkCollection.id,
                            }),
                            {
                                onSuccess: () => {
                                    setActiveEditModal(false);
                                },
                            },
                        );
                    }}
                    handleDelete={() => {
                        // Handle delete if needed
                        setActiveEditModal(false);
                    }}
                />
            </Modal>
        </div>
    );
};

export default BookmarkCollectionPage;
