import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import { useList } from '@/Context/ListContext';
import { TransitionListPageProps } from '@/types/general';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { List, Loader, PlusIcon, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

interface BookmarkPage1Props extends TransitionListPageProps {
    bookmarkId: string;
    associateCollectionId?: string;
    isBookmarked?: boolean;
    handleRemoveBookmark?: () => void;
    onNavigate?: (pageIndex: number) => void;
    onClose?: () => void;
}

const BookmarkPage1 = ({
    bookmarkId,
    onNavigate,
    isBookmarked,
    handleRemoveBookmark,
    associateCollectionId,
    onClose,
}: BookmarkPage1Props) => {
    const { t } = useLaravelReactI18n();
    const {
        lists,
        isLoadingLists,
        fetchLists,
        addBookmarkToList,
        removeBookmarkFromList,
        getPreferredList,
    } = useList();

    const [isLoading, setIsLoading] = useState(false);
    const [selectedListId, setSelectedListId] = useState<string | null>(
        associateCollectionId || null,
    );
    const [loadingListId, setLoadingListId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLists();
    }, []);

    // Update selected list when associateCollectionId changes or lists load
    useEffect(() => {
        if (associateCollectionId) {
            setSelectedListId(associateCollectionId);
        }
    }, [associateCollectionId, lists]);

    // Sync with preferred list (for auto-add feature)
    useEffect(() => {
        const preferredList = getPreferredList();
        if (preferredList && !selectedListId) {
            setSelectedListId(preferredList.listId);
        }
    }, []);

    // Filter lists based on search query
    const filteredLists = useMemo(() => {
        if (!searchQuery.trim()) return lists;
        return lists.filter((list) =>
            list.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [lists, searchQuery]);

    const handleAddAllClick = () => {
        toast.info(t('comingSoon'));
    };

    const handleCheckboxChange = async (listId: string) => {
        setIsLoading(true);
        setLoadingListId(listId);

        try {
            // If selecting the already selected list, deselect it
            if (listId === selectedListId) {
                await removeBookmarkFromList(listId, bookmarkId);
                setSelectedListId(null);
                // Toast for removing bookmark from list
                toast.success(t('Bookmark Removed From List'), {
                    className: 'bg-gray-800 text-white',
                    toastId: 'bookmark-removed-from-list',
                });
            } else {
                // Otherwise, add bookmark to the newly selected list
                await addBookmarkToList(listId, bookmarkId);
                setSelectedListId(listId);
                // Toast for adding bookmark to list
                toast.success(t('Bookmark Added To List'), {
                    className: 'bg-gray-800 text-white',
                    toastId: 'bookmark-added-to-list',
                });
            }
        } catch (error) {
            console.error('Error updating list selection', error);
            toast.error(t('listQuickCreate.errorUpdating'));
        } finally {
            setLoadingListId(null);
            setIsLoading(false);
        }
    };

    const SkeletonLoader = () => (
        <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="flex items-center justify-between gap-2 py-1"
                >
                    <div className="h-4 w-full rounded bg-gray-200"></div>
                    <div className="h-4 w-4 rounded bg-gray-200"></div>
                </div>
            ))}
        </div>
    );

    const NoListsState = () => (
        <div className="flex flex-col items-center justify-center space-y-1 py-2">
            <List className="h-10 w-10 text-gray-500" />
            <div className="text-center">
                <Paragraph size="md" className="text-gray-700">
                    {t('listQuickCreate.noLists')}
                </Paragraph>
                <Paragraph size="sm" className="text-gray-500">
                    {t('listQuickCreate.createListLong')}
                </Paragraph>
            </div>
        </div>
    );

    const CheckboxWithLoading = ({
        isLoading,
        ...props
    }: {
        isLoading: boolean;
    } & React.InputHTMLAttributes<HTMLInputElement>) => (
        <>
            {isLoading ? (
                <Loader size={12} className="text-primary animate-spin" />
            ) : (
                <Checkbox {...props} />
            )}
        </>
    );

    return (
        <div className="space-y-1" data-testid="bookmark-page1">
            <div className="bg-primary-light relative">
                <Paragraph
                    size="md"
                    className="text-content-black-persist px-3 py-2 pr-10 font-bold"
                >
                    {t('listQuickCreate.addBookmark')}
                </Paragraph>
                <button
                    onClick={onClose}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-200"
                    aria-label="Close popup"
                    data-testid="bookmark-close-button"
                >
                    <X size={16} className="text-gray-600" />
                </button>
            </div>
            <section className="flex flex-col gap-3 px-3">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-light italic">
                        {t('listQuickCreate.successfulBookmarked')}
                    </span>
                    <button
                        className="text-error cursor-pointer font-semibold"
                        disabled={!isBookmarked}
                        onClick={handleRemoveBookmark}
                        data-testid="remove-bookmark-button"
                    >
                        {t('listQuickCreate.removeBookmark')}
                    </button>
                </div>

                {isLoadingLists ? (
                    <SkeletonLoader />
                ) : lists.length === 0 ? (
                    <NoListsState />
                ) : (
                    <>
                        {/* Search input */}
                        <div className="relative mb-2">
                            <Search size={14} className="text-content absolute left-2 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('Search lists...')}
                                className="bg-background text-content border-gray-light focus:ring-primary focus:border-primary w-full rounded-md border border-opacity-40 py-1.5 pl-7 pr-2 text-sm shadow-xs focus:outline-none"
                                data-testid="bookmark-list-search"
                                onKeyDown={(e) => {
                                    if (e.key === ' ') {
                                        e.stopPropagation();
                                    }
                                }}
                            />
                        </div>
                        <div className="no-scrollbar flex max-h-36 flex-col gap-2 overflow-y-scroll" data-testid="bookmark-lists-container">
                            {/* Add All option (button, not checkbox) */}
                            {!searchQuery && (
                                <button
                                    onClick={handleAddAllClick}
                                    className={`flex items-center text-left ${isLoading
                                        ? 'cursor-not-allowed opacity-70'
                                        : 'cursor-pointer'
                                        }`}
                                    disabled={isLoading}
                                >
                                    <Paragraph
                                        size="md"
                                        className="text-primary font-medium"
                                    >
                                        {t('listQuickCreate.addAll')}
                                    </Paragraph>
                                </button>
                            )}

                            {/* List options with checkbox that behaves like radio buttons */}
                            {filteredLists.map((list) => (
                            <label
                                key={list.id}
                                htmlFor={list.id}
                                data-testid={`bookmark-list-item-${list.id}`}
                                className={`flex items-center justify-between ${isLoading
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer'
                                    }`}
                            >
                                <Paragraph size="md">{list.title}</Paragraph>
                                <CheckboxWithLoading
                                    type="checkbox"
                                    id={list.id}
                                    name={list.id}
                                    checked={selectedListId === list.id}
                                    onChange={() =>
                                        handleCheckboxChange(list.id)
                                    }
                                    isLoading={loadingListId === list.id}
                                    disabled={
                                        isLoading || loadingListId !== null
                                    }
                                    style={{
                                        pointerEvents: isLoading
                                            ? 'none'
                                            : 'auto',
                                    }}
                                    data-testid={`bookmark-list-checkbox-${list.id}`}
                                />
                            </label>
                        ))}
                            {filteredLists.length === 0 && searchQuery && (
                                <Paragraph size="sm" className="text-gray-500 text-center py-2">
                                    {t('No lists found')}
                                </Paragraph>
                            )}
                        </div>
                    </>
                )}

                <PrimaryButton
                    className="my-2 flex w-full items-center justify-center rounded-lg text-center capitalize"
                    onClick={() => onNavigate?.(1)}
                    disabled={isLoading}
                    data-testid="add-list-button"
                >
                    <PlusIcon size={16} className="mr-2" />
                    <Paragraph size="md">
                        {t('listQuickCreate.addList')}
                    </Paragraph>
                </PrimaryButton>
            </section>
        </div>
    );
};

export default BookmarkPage1;
