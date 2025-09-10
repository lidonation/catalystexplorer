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
import { Head, router } from '@inertiajs/react';
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
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import CommunityData = App.DataTransferObjects.CommunityData;
import ProposalData = App.DataTransferObjects.ProposalData;
import GroupData = App.DataTransferObjects.GroupData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;

type BookmarkCollectionListProps =
    | {
        type: 'proposals';
        proposals: PaginatedData<ProposalData[]> | { data: ProposalData[], total: number, isPdf: boolean };
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
    const { t } = useLaravelReactI18n();
    const [activeTab, setTab] = useState(type);

    const setActiveTab = (val: typeof type) => {
        const route = generateLocalizedRoute('my.lists.manage', {
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
                    <ProposalContent {...props} />
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

            {/* modals */}
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
        </div>
    );
};

const ProposalContent = (props: BookmarkCollectionListProps) => {
    const { type, bookmarkCollection } = props;
    const { getFilter, setFilters, filters } = useFilterContext();
    const { t } = useLaravelReactI18n();

    const [isHorizontal, setIsHorizontal] = useState(false);
    const [isMini, setIsMini] = useState(false);
    const [quickPitchView, setQuickPitchView] = useState(
        !!parseInt(getFilter(ParamsEnum.QUICK_PITCHES) || '0')
    );
    const [isTableView, setIsTableView] = useState(false);

    const currentView = getFilter(ParamsEnum.VIEW);
    const isUnpaginatedPdf = type === 'proposals' && 'isPdf' in props.proposals && props.proposals.isPdf;
    const isPdfView = currentView === 'pdf' || isUnpaginatedPdf;

    const [pdfView, setPdfView] = useState(isPdfView);

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

    const getWorkflowUrl = () => {
        const step = 3;

        switch (bookmarkCollection.list_type) {
            case 'voter':
                return useLocalizedRoute('workflows.createVoterList.index', {
                    step,
                    bookmarkCollection: bookmarkCollection.id
                });

            case 'tinder':

                return useLocalizedRoute('workflows.tinderProposal.index', {
                    step,
                    leftBookmarkCollectionHash: bookmarkCollection.workflow_params?.leftBookmarkCollectionHash,
                    rightBookmarkCollectionHash: bookmarkCollection.workflow_params?.rightBookmarkCollectionHash,
                    tinderCollectionHash: bookmarkCollection.workflow_params?.tinderCollectionHash
                });

            case 'normal':
                return useLocalizedRoute('workflows.bookmarks.index', {
                    step,
                    bookmarkCollection: bookmarkCollection.id
                });

            default:
                return '';
        }
    };

    const dropdownMenuItems: DropdownMenuItem[] = [

        {
            label: t('bookmarks.listSetting'),
            type: 'button',
            onClick: () => {
                setActiveEditModal(true);
            },
            isDefault: true
        },

        {
            label: t('workflows.tinderProposal.step4.keepSwiping'),
            type: 'link' as const,
            href: isTinderList ? getWorkflowUrl() : '',
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
            href: ((isVoterList || isNormalList)) ? getWorkflowUrl() : '',
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
    ];

    useEffect(() => {
        const quickPitchFromFilter = !!parseInt(getFilter(ParamsEnum.QUICK_PITCHES) || '0');
        if (quickPitchFromFilter !== quickPitchView) {
            setQuickPitchView(quickPitchFromFilter);
        }

        const currentPdfView = currentView === 'pdf' || isUnpaginatedPdf;
        if (currentPdfView !== pdfView) {
            setPdfView(currentPdfView);
        }

        if (currentPdfView) {
            setIsHorizontal(false);
            setIsMini(false);
            setIsTableView(false);
            if (quickPitchView) {
                setQuickPitchView(false);
            }
        }
    }, [filters, currentView, isUnpaginatedPdf, pdfView, quickPitchView]);

    const clearAllFilters = () => {
        setIsHorizontal(false);
        setIsMini(false);
        setIsTableView(false);
        setQuickPitchView(false);

        const currentUrl = window.location.pathname;
        router.get(currentUrl, {}, {
            preserveState: false, 
            preserveScroll: true,
            only: [type],
        });
    };

    // Handle PDF view changes
    const handleSetPdfView = (value: boolean) => {
        if (value) {
            // When setting PDF view, clear other view states
            setIsHorizontal(false);
            setIsMini(false);
            setIsTableView(false);
            setQuickPitchView(false);

            // Set the PDF view filter
            setFilters({
                param: ParamsEnum.VIEW,
                value: 'pdf',
                label: undefined,
            });
        } else {
            // When clearing PDF view, remove the filter
            setFilters({
                param: ParamsEnum.VIEW,
                value: '',
                label: undefined,
            });
        }
    };

    // Wrapper functions that clear filters before changing layout
    const handleSetIsHorizontal = (value: boolean) => {
        setIsHorizontal(value);
    };

    const handleSetIsMini = (value: boolean) => {
        setIsMini(value);
    };

    const handleSetQuickPitchView = (value: boolean) => {
        setQuickPitchView(value);
    };

    const handleSetIsTableView = (value: boolean) => {
        setIsTableView(value);
    };

    const component = (() => {
        switch (type) {
            case 'proposals':
                const itemCount = isUnpaginatedPdf
                    ? props.proposals.data.length
                    : 'data' in props.proposals
                        ? props.proposals.data.length
                        : 0;

                if (isPdfView) {
                    return (
                        <div className="container">
                            <ProposalPdfView
                                proposals={props.proposals}
                                listTitle={bookmarkCollection.title ?? 'My List'}
                                onOpenSettings={() => setActiveEditModal(true)}
                                isAuthor={true}
                            />
                        </div>
                    );
                }
                return (
                    <ProposalPaginatedList
                        proposals={props.proposals as PaginatedData<ProposalData[]>}
                        isHorizontal={isHorizontal}
                        isMini={isMini}
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
            {/* Layout controls - always show dropdown on far right */}
            <div className="container mb-4 flex justify-end items-center gap-4">
                {/* CardLayoutSwitcher - only show for proposals tab */}
                {type === 'proposals' && (
                    <CardLayoutSwitcher
                        isHorizontal={isHorizontal}
                        quickPitchView={quickPitchView}
                        isMini={isMini}
                        isTableView={isTableView}
                        setIsHorizontal={handleSetIsHorizontal}
                        setIsMini={handleSetIsMini}
                        setGlobalQuickPitchView={handleSetQuickPitchView}
                        setIsTableView={handleSetIsTableView}
                        isPdfView={isPdfView}
                        setPdfView={handleSetPdfView}
                        hideTableView={true}
                        hidePdfView={false}
                        onClearAllFilters={clearAllFilters}
                    />
                )}

                {/* Dropdown always on the right */}
                <DropdownMenu
                    items={dropdownMenuItems}
                    className="relative"
                    dropdownClassName="bg-background border border-gray-200 rounded-lg shadow-lg overflow-visible"
                    matchButtonWidth={true}
                />
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

export default Manage;
