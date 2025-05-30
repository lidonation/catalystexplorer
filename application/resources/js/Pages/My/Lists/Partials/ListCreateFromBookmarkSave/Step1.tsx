import { TransitionListPageProps } from '@/types/general';
import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import { useList } from '@/Context/ListContext';
import { List, Loader, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

interface BookmarkPage1Props extends TransitionListPageProps {
    bookmarkId: string;
    associateCollectionId?: string;
    isBookmarked?: boolean;
    handleRemoveBookmark?: () => void;
    onNavigate?: (pageIndex: number) => void;
}

const BookmarkPage1 = ({
    bookmarkId,
    onNavigate,
    isBookmarked,
    handleRemoveBookmark,
    associateCollectionId,
}: BookmarkPage1Props) => {
    const { t } = useTranslation();
    const {
        lists,
        isLoadingLists,
        fetchLists,
        addBookmarkToList,
        removeBookmarkFromList,
    } = useList();

    const [isLoading, setIsLoading] = useState(false);
    const [selectedListId, setSelectedListId] = useState<string | null>(
        associateCollectionId || null,
    );
    const [loadingListId, setLoadingListId] = useState<string | null>(null);

    useEffect(() => {
        fetchLists();
    }, []);

    // Update selected list when associateCollectionId changes or lists load
    useEffect(() => {
        if (associateCollectionId) {
            setSelectedListId(associateCollectionId);
        }
    }, [associateCollectionId, lists]);

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
            } else {
                // Otherwise, add bookmark to the newly selected list
                await addBookmarkToList(listId, bookmarkId);
                setSelectedListId(listId);
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
        <div className="space-y-1">
            <div className="bg-primary-light">
                <Paragraph
                    size="md"
                    className="text-content px-3 py-2 font-bold"
                >
                    {t('listQuickCreate.addBookmark')}
                </Paragraph>
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
                    >
                        {t('listQuickCreate.removeBookmark')}
                    </button>
                </div>

                {isLoadingLists ? (
                    <SkeletonLoader />
                ) : lists.length === 0 ? (
                    <NoListsState />
                ) : (
                    <div className="no-scrollbar flex max-h-24 flex-col gap-2 overflow-y-scroll">
                        {/* Add All option (button, not checkbox) */}
                        <button
                            onClick={handleAddAllClick}
                            className={`flex items-center text-left ${
                                isLoading
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

                        {/* List options with checkbox that behaves like radio buttons */}
                        {lists.map((list) => (
                            <label
                                key={list.id}
                                htmlFor={list.id}
                                className={`flex items-center justify-between ${
                                    isLoading
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
                                />
                            </label>
                        ))}
                    </div>
                )}

                <PrimaryButton
                    className="my-2 flex w-full items-center justify-center rounded-lg text-center capitalize"
                    onClick={() => onNavigate?.(1)}
                    disabled={isLoading}
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
