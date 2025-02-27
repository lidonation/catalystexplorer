import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import { useList } from '@/Context/ListContext';
import { List, Loader, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { TransitionListPageProps } from '../../../../../../types/general';

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
    const [checkedItems, setCheckedItems] = useState<{
        [key: string]: boolean;
    }>({});
    const [addAllChecked, setAddAllChecked] = useState(false);
    const [loadingItems, setLoadingItems] = useState<{
        [key: string]: boolean;
    }>({});

    useEffect(() => {
        fetchLists();
    }, []);

    useEffect(() => {
        if (associateCollectionId) {
            setCheckedItems((prev) => ({
                ...prev,
                [associateCollectionId]: true,
            }));
        }
    }, [lists]);

    const checkboxValues = [
        {
            label: t('listQuickCreate.addAll'),
            value: 'addAll',
        },
        ...lists.map((list) => ({
            label: list.title,
            value: list.id,
        })),
    ];

    const handleAddAllChange = async (checked: boolean) => {
        toast.info(t('comingSoon'));
    };

    const handleIndividualChange = async (listId: string, checked: boolean) => {
        setIsLoading(true);
        setLoadingItems((prev) => ({
            ...prev,
            [listId]: true,
        }));

        try {
            if (checked) {
                await addBookmarkToList(listId, bookmarkId);
            } else {
                await removeBookmarkFromList(listId, bookmarkId);
            }

            setCheckedItems((prev) => ({
                ...prev,
                [listId]: checked,
                ...(selectedListId && { [selectedListId]: false }),
            }));

            const updatedCheckedItems = {
                ...checkedItems,
                [listId]: checked,
                ...(selectedListId && { [selectedListId]: false }),
            };

            const allItemsChecked = lists.every(
                (list) => updatedCheckedItems[list.id] === true,
            );

            setAddAllChecked(allItemsChecked);
            setSelectedListId(listId);
            setIsLoading(false);
        } catch (error) {
            console.error('Error updating list', listId, error);
        } finally {
            setLoadingItems((prev) => ({
                ...prev,
                [listId]: false,
            }));
            setIsLoading(false);
        }
    };

    const handleCheckboxChange = (value: string) => {
        if (value !== 'addAll' && loadingItems[value]) return;

        if (value === 'addAll') {
            const newCheckedState = !addAllChecked;
            handleAddAllChange(newCheckedState);
        } else {
            const currentChecked = checkedItems[value] || false;
            handleIndividualChange(value, !currentChecked);
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
                        {checkboxValues.map((checkbox, index) => (
                            <label
                                key={index}
                                htmlFor={checkbox.value}
                                className={`flex  items-center justify-between ${
                                    isLoading ? (
                                        loadingItems[checkbox.value] ? 'cursor-progress' : 'cursor-not-allowed'
                                    ) : 'cursor-pointer'
                                }`}
                            >
                                <Paragraph size="md">
                                    {checkbox.label}
                                </Paragraph>
                                <CheckboxWithLoading
                                    type="checkbox"
                                    id={checkbox.value}
                                    name={checkbox.value}
                                    value={checkbox.value}
                                    checked={
                                        checkbox.value === 'addAll'
                                            ? addAllChecked
                                            : checkedItems[checkbox.value] ||
                                              false
                                    }
                                    onChange={() =>
                                        handleCheckboxChange(checkbox.value)
                                    }
                                    isLoading={
                                        loadingItems[checkbox.value] || false
                                    }
                                    disabled={isLoading}
                                    style={{
                                        pointerEvents: isLoading
                                            ? 'none'
                                            : 'auto',
                                        cursor: isLoading
                                            ? 'not-allowed'
                                            : 'pointer',
                                    }}
                                />
                            </label>
                        ))}
                    </div>
                )}

                <PrimaryButton
                    className="my-2 flex w-full items-center justify-center rounded-lg text-center capitalize"
                    onClick={() => onNavigate?.(1)}
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
