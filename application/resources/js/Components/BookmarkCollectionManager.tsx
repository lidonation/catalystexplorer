import Button from '@/Components/atoms/Button';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Title from '@/Components/atoms/Title';
import Comments from '@/Components/Comments';
import Modal from '@/Components/layout/Modal.tsx';
import { ReviewList } from '@/Components/ReviewList';
import { BookmarkProvider } from '@/Context/BookmarkContext';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import BookmarkModelSearch from '../Pages/Bookmarks/Partials/BookmarkModelSearch';
import DropdownMenu, {
    DropdownMenuItem,
} from '../Pages/Bookmarks/Partials/DropdownMenu';
import ListSettingsForm, {
    ListForm,
} from '../Pages/Bookmarks/Partials/ListSettingsForm.tsx';
import CommunitiesPaginatedList from '../Pages/Communities/Partials/CommunitiesPaginatedList';
import GroupPaginatedList from '../Pages/Groups/Partials/GroupPaginatedList';
import IdeascaleProfilePaginatedList from '../Pages/IdeascaleProfile/Partials/IdeascaleProfilePaginatedList';
import ProposalPaginatedList from '../Pages/Proposals/Partials/ProposalPaginatedList';
import ProposalTable from '../Pages/Proposals/Partials/ProposalTable';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import CommunityData = App.DataTransferObjects.CommunityData;
import ProposalData = App.DataTransferObjects.ProposalData;
import GroupData = App.DataTransferObjects.GroupData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;
import UserData = App.DataTransferObjects.UserData;

type BookmarkCollectionType =
    | 'proposals'
    | 'communities'
    | 'groups'
    | 'ideascaleProfiles'
    | 'reviews';

interface User {
    id: string;
    name: string;
    email: string;
    media?: Array<{
        id: string;
        original_url: string;
        name: string;
    }>;
}

interface BookmarkCollectionManagerProps {
    type: BookmarkCollectionType;
    bookmarkCollection: BookmarkCollectionData;
    filters: SearchParams;
    proposals?: PaginatedData<ProposalData[]>;
    communities?: PaginatedData<CommunityData[]>;
    groups?: PaginatedData<GroupData[]>;
    ideascaleProfiles?: PaginatedData<IdeascaleProfileData[]>;
    reviews?: PaginatedData<ReviewData[]>;
    contributors?: User[];
    owner?: User;
}

interface BookmarkCollectionManagerConfig {
    showHead?: boolean;
    showHeader?: boolean;
    showComments?: boolean;
    showEditButton?: boolean;
    showDropdownMenu?: boolean;
    showSearchBar?: boolean;
    proposalDisplayMode?: 'list' | 'table';
    dropdownMenuItems?: DropdownMenuItem[];
    activeTab: string;
    onTabChange: (tab: BookmarkCollectionType) => void;
    onUpdate?: (form: ListForm) => void;
    onDelete?: () => void;
}

const BookmarkCollectionManager = (
    props: BookmarkCollectionManagerProps & BookmarkCollectionManagerConfig,
) => {
    const {
        type,
        bookmarkCollection,
        showHead = true,
        showHeader = true,
        showComments = true,
        showEditButton = true,
        showDropdownMenu = true,
        showSearchBar = false,
        proposalDisplayMode = 'list',
        dropdownMenuItems = [],
        activeTab,
        onTabChange,
        onUpdate,
        onDelete,
    } = props;
    const { t } = useLaravelReactI18n();

    const [activeEditModal, setActiveEditModal] = useState<boolean>(false);
    const [activeConfirm, setActiveConfirm] = useState<boolean>(false);

    const handleUpdate = (form: ListForm) => {
        if (onUpdate) {
            onUpdate(form);
        }
    };

    const handleDelete = () => {
        setActiveConfirm(false);
        if (onDelete) {
            onDelete();
        }
    };

    const component = (() => {
        switch (type) {
            case 'proposals':
                return props.proposals ? (
                    <div>
                        {proposalDisplayMode === 'table' ? (
                            <ProposalTable
                                actionType="view"
                                disableSorting={true}
                                proposals={props.proposals}
                                columnVisibility={{
                                    fund: true,
                                    proposal: false,
                                    title: true,
                                    yesVotes: true,
                                    abstainVotes: true,
                                    teams: false,
                                }}
                            />
                        ) : (
                            <ProposalPaginatedList
                                proposals={props.proposals}
                                isHorizontal={false}
                                isMini={false}
                            />
                        )}
                    </div>
                ) : null;
            case 'communities':
                return props.communities ? (
                    <CommunitiesPaginatedList
                        communities={props.communities}
                        cardType="mini"
                        gridCols="grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-4"
                    />
                ) : null;
            case 'groups':
                return props.groups ? (
                    <GroupPaginatedList
                        groups={props.groups}
                        cardType="mini"
                        gridCols="grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-4 auto-rows-fr"
                    />
                ) : null;
            case 'ideascaleProfiles':
                return props.ideascaleProfiles ? (
                    <IdeascaleProfilePaginatedList
                        ideascaleProfiles={props.ideascaleProfiles}
                    />
                ) : null;
            case 'reviews':
                return props.reviews ? (
                    <ReviewList className="container" reviews={props.reviews} />
                ) : null;
            default:
                return null;
        }
    })();

    const preselected = () => {
        switch (props.type) {
            case 'proposals':
                return props.proposals
                    ? {
                          proposals: props.proposals.data.map(
                              (item) => item.id,
                          ),
                      }
                    : {};
            case 'communities':
                return props.communities
                    ? {
                          communities: props.communities.data.map(
                              (item) => item.id,
                          ),
                      }
                    : {};
            case 'groups':
                return props.groups
                    ? {
                          groups: props.groups.data.map((item) => item.id),
                      }
                    : {};
            case 'ideascaleProfiles':
                return props.ideascaleProfiles
                    ? {
                          ideascaleProfiles: props.ideascaleProfiles.data.map(
                              (item) => item.id,
                          ),
                      }
                    : {};
            case 'reviews':
                return props.reviews
                    ? {
                          reviews: props.reviews.data.map((item) => item.id),
                      }
                    : {};
            default:
                return {};
        }
    };

    return (
        <div>
            {showHead && <Head title={t('bookmarks.listTitle')} />}

            {showHeader && (
                <header className="container mt-4 flex flex-col items-start lg:mt-6">
                    <Title level="1">
                        {bookmarkCollection.title ?? ''}
                        {/*{bookmarkCollection.tinder_direction === 'right' && t('rightSwipes')}*/}
                        {/*{bookmarkCollection.tinder_direction === 'left' && t('leftSwipes')}*/}
                    </Title>
                    <p className="text-content">
                        {t(bookmarkCollection.content ?? '')}
                    </p>
                </header>
            )}

            <BookmarkProvider
                bookmarkCollection={bookmarkCollection}
                preselected={
                    preselected() as unknown as Record<string, string[]>
                }
            >
                {/* Sticky or fixed header with padding */}
                <div className="container w-full py-4 lg:relative">
                    <div className="top-6 right-8 z-50 mb-6 flex flex-row justify-between gap-4 lg:absolute lg:mb-0 lg:ml-auto">
                        {showEditButton && (
                            <Button
                                className="text-primary text-sm text-nowrap hover:cursor-pointer"
                                onClick={() => setActiveEditModal(true)}
                            >
                                {`${t('bookmarks.listSetting')}`}
                            </Button>
                        )}
                        {showDropdownMenu && (
                            <DropdownMenu items={dropdownMenuItems} />
                        )}
                    </div>
                </div>

                <FiltersProvider
                    defaultFilters={props.filters}
                    //routerOptions={{ preserveState: true, replace: true }}
                >
                    <BookmarkCollectionContent
                        {...props}
                        component={component}
                        onTabChange={onTabChange}
                        activeTab={activeTab}
                        showSearchBar={showSearchBar}
                        type={type}
                    />
                </FiltersProvider>
            </BookmarkProvider>

            {/* comments */}
            {showComments && !!bookmarkCollection.allow_comments && (
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
                <ListSettingsForm
                    bookmarkCollection={bookmarkCollection}
                    handleSave={handleUpdate}
                    handleDelete={() => setActiveConfirm(true)}
                    contributors={props.contributors}
                    owner={props.owner}
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

// Internal component that handles tab changes with access to FiltersContext
const BookmarkCollectionContent = (
    props: BookmarkCollectionManagerProps &
        BookmarkCollectionManagerConfig & {
            component: React.ReactNode;
        },
) => {
    const { setFilters } = useFilterContext();
    const { activeTab, onTabChange, showSearchBar, type, component } = props;

    const handleTabChange = (tab: string) => {
        onTabChange(tab as BookmarkCollectionType);
    };

    return (
        <>
            <div className="w-full">
                <BookmarkModelSearch
                    activeTab={activeTab}
                    handleTabchange={handleTabChange}
                    search={showSearchBar}
                />
            </div>
            <div className="my-2 w-full">{component}</div>
        </>
    );
};

export default BookmarkCollectionManager;
export type {
    BookmarkCollectionManagerConfig,
    BookmarkCollectionManagerProps,
    BookmarkCollectionType,
};
