import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import { useList } from '@/Context/ListContext';
import { List, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TransitionListPageProps } from '../../../../../../types/general';

interface BookmarkPage1Props extends TransitionListPageProps {
    isBookmarked?: boolean;
    handleRemoveBookmark?: () => void;
    onNavigate?: (pageIndex: number) => void;
}

const BookmarkPage1 = ({
    onNavigate,
    isBookmarked,
    handleRemoveBookmark,
}: BookmarkPage1Props) => {
    const { lists, isLoadingLists, fetchLists } = useList();
    const [checkedItems, setCheckedItems] = useState<{
        [key: string]: boolean;
    }>({});
    const [addAllChecked, setAddAllChecked] = useState(false);

    useEffect(() => {
        fetchLists();
    }, []);

    const checkboxValues = [
        { label: 'Add to List', value: 'addAll' },
        ...lists.map((list) => ({
            label: list.name,
            value: list.id,
        })),
    ];

    const handleCheckboxChange = (value: string) => {
        if (value === 'addAll') {
            const newCheckedState = !addAllChecked;
            setAddAllChecked(newCheckedState);

            const newCheckedItems = { ...checkedItems };
            lists.forEach((list) => {
                newCheckedItems[list.id] = newCheckedState;
            });
            setCheckedItems(newCheckedItems);
        } else {
            setCheckedItems((prev) => ({
                ...prev,
                [value]: !prev[value],
            }));
        }
    };

    const SkeletonLoader = () => (
        <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="flex items-center justify-between py-1 gap-2"
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
                <p className="text-gray-700">No lists found</p>
                <p className="text-sm text-gray-500">
                    Create a new list to get started
                </p>
            </div>
        </div>
    );

    return (
        <div className="space-y-1">
            <div className="bg-primary-light">
                <p className="px-3 py-2 font-bold text-content">Add Bookmark</p>
            </div>
            <section className="flex flex-col gap-3 px-3">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-light italic">
                        Successfully added to your bookmarks!
                    </span>
                    <button
                        className="font-semibold text-error"
                        disabled={!isBookmarked}
                        onClick={handleRemoveBookmark}
                    >
                        Remove
                    </button>
                </div>

                {isLoadingLists ? (
                    <SkeletonLoader />
                ) : lists.length === 0 ? (
                    <NoListsState />
                ) : (
                    <div className="flex max-h-24 flex-col gap-2 overflow-y-scroll">
                        {checkboxValues.map((checkbox, index) => (
                            <label
                                key={index}
                                htmlFor={checkbox.value}
                                className="flex cursor-pointer items-center justify-between"
                            >
                                <p>{checkbox.label}</p>
                                <Checkbox
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
                    <p>New List</p>
                </PrimaryButton>
            </section>
        </div>
    );
};

export default BookmarkPage1;
