import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import { useList } from '@/Context/ListContext';
import { TransitionListPageProps } from '@/types/general';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { List, Loader, PlusIcon, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

export interface BookmarkCollection {
    bookmarkItemId: string;
    collectionId: string;
    title: string;
}

interface BookmarkPage1Props extends TransitionListPageProps {
    bookmarkId: string;
    associateCollectionId?: string;
    isBookmarked?: boolean;
    handleRemoveBookmark?: (bookmarkItemId?: string) => void;
    collections?: BookmarkCollection[];
    collectionsCount?: number;
    onRefetch?: () => Promise<void>;
    onNavigate?: (pageIndex: number) => void;
    onClose?: () => void;
    mode?: 'add' | 'remove';
}

const BookmarkPage1 = ({
    bookmarkId,
    onNavigate,
    isBookmarked,
    handleRemoveBookmark,
    associateCollectionId,
    collections = [],
    collectionsCount = 0,
    onRefetch,
    onClose,
    mode = 'add',
}: BookmarkPage1Props) => {
    const { t } = useLaravelReactI18n();
    const {
        lists,
        isLoadingLists,
        fetchLists,
        addBookmarkToList,
    } = useList();

    const [isLoading, setIsLoading] = useState(false);
    const [loadingListId, setLoadingListId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedForRemoval, setSelectedForRemoval] = useState<Set<string>>(new Set());

    const isRemoveMode = mode === 'remove';

    // Create a map of collectionId -> bookmarkItemId for quick lookup
    const collectionToBookmarkMap = useMemo(() => {
        const map = new Map<string, string>();
        collections.forEach(col => map.set(col.collectionId, col.bookmarkItemId));
        return map;
    }, [collections]);

    useEffect(() => {
        if (!isRemoveMode) {
            fetchLists();
        }
    }, [isRemoveMode]);

    // For remove mode: show only collections the item belongs to
    // For add mode: show all lists
    const displayLists = useMemo(() => {
        if (isRemoveMode) {
            return collections.map(col => ({
                id: col.collectionId,
                title: col.title,
                bookmarkItemId: col.bookmarkItemId,
            }));
        }
        return lists;
    }, [isRemoveMode, collections, lists]);

    // Filter based on search query
    const filteredLists = useMemo(() => {
        if (!searchQuery.trim()) return displayLists;
        return displayLists.filter((list) =>
            list.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [displayLists, searchQuery]);

    // Check if a list contains this bookmark (for add mode)
    const isInList = (listId: string) => collectionToBookmarkMap.has(listId);

    const handleAddAllClick = () => {
        toast.info(t('comingSoon'));
    };

    // Toggle selection for removal (remove mode)
    const toggleRemovalSelection = (bookmarkItemId: string) => {
        setSelectedForRemoval(prev => {
            const newSet = new Set(prev);
            if (newSet.has(bookmarkItemId)) {
                newSet.delete(bookmarkItemId);
            } else {
                newSet.add(bookmarkItemId);
            }
            return newSet;
        });
    };

    // Handle adding to a list (add mode)
    const handleAddToList = async (listId: string) => {
        if (isInList(listId)) return;
        
        setIsLoading(true);
        setLoadingListId(listId);

        try {
            await addBookmarkToList(listId, bookmarkId);
            toast.success(t('Bookmark Added To List'), {
                className: 'bg-gray-800 text-white',
                toastId: 'bookmark-added-to-list',
            });
            await onRefetch?.();
        } catch (error) {
            console.error('Error adding to list', error);
            toast.error(t('listQuickCreate.errorUpdating'));
        } finally {
            setLoadingListId(null);
            setIsLoading(false);
        }
    };

    // Handle removing selected items (remove mode)
    const handleRemoveSelected = async () => {
        if (selectedForRemoval.size === 0) {
            toast.warning(t('Please select at least one list'));
            return;
        }

        setIsLoading(true);
        try {
            for (const bookmarkItemId of selectedForRemoval) {
                await handleRemoveBookmark?.(bookmarkItemId);
            }
            toast.success(t('Removed from selected lists'), {
                className: 'bg-gray-800 text-white',
                toastId: 'bookmark-removed-from-lists',
            });
            setSelectedForRemoval(new Set());
            await onRefetch?.();
        } catch (error) {
            console.error('Error removing from lists', error);
            toast.error(t('listQuickCreate.errorUpdating'));
        } finally {
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
                    {isRemoveMode ? t('Remove from Lists') : t('listQuickCreate.addBookmark')}
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
                        onClick={() => handleRemoveBookmark?.()}
                        data-testid="remove-bookmark-button"
                    >
                        {t('listQuickCreate.removeBookmark')}
                    </button>
                </div>

                {isLoadingLists && !isRemoveMode ? (
                    <SkeletonLoader />
                ) : displayLists.length === 0 ? (
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
                            {/* Add All option - only in add mode */}
                            {!isRemoveMode && !searchQuery && (
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

                            {/* List options */}
                            {filteredLists.map((list: any) => (
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
                                    {isRemoveMode ? (
                                        <Checkbox
                                            type="checkbox"
                                            id={list.id}
                                            name={list.id}
                                            checked={selectedForRemoval.has(list.bookmarkItemId)}
                                            onChange={() => toggleRemovalSelection(list.bookmarkItemId)}
                                            disabled={isLoading}
                                            data-testid={`bookmark-list-checkbox-${list.id}`}
                                        />
                                    ) : (
                                        <CheckboxWithLoading
                                            type="checkbox"
                                            id={list.id}
                                            name={list.id}
                                            checked={isInList(list.id)}
                                            onChange={() => handleAddToList(list.id)}
                                            isLoading={loadingListId === list.id}
                                            disabled={isLoading || loadingListId !== null}
                                            style={{
                                                pointerEvents: isLoading ? 'none' : 'auto',
                                            }}
                                            data-testid={`bookmark-list-checkbox-${list.id}`}
                                        />
                                    )}
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

                {isRemoveMode ? (
                    <PrimaryButton
                        className="my-2 flex w-full items-center justify-center rounded-lg text-center capitalize"
                        onClick={handleRemoveSelected}
                        disabled={isLoading || selectedForRemoval.size === 0}
                        data-testid="remove-selected-button"
                    >
                        {isLoading && <Loader size={16} className="animate-spin mr-2" />}
                        <Paragraph size="md">
                            {t('Remove')} {selectedForRemoval.size > 0 && `(${selectedForRemoval.size})`}
                        </Paragraph>
                    </PrimaryButton>
                ) : (
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
                )}
            </section>
        </div>
    );
};

export default BookmarkPage1;
