import Button from '@/Components/atoms/Button';
import Selector from '@/Components/Select';
import FilterLinesIcon from '@/Components/svgs/FilterLinesIcon';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BookmarkSearchControls from './BookmarkSearchControls';


const BookmarkToolbar = () => {
    const [toggleFilterVisibility, setToggleFilterVisibility] = useState(false);
    const filters = (search: string) => {}
    const setFilters = (search: string) => {}
    const { t } = useTranslation();

    const sortingOptions: { label: string; value: string; }[] | undefined = [];

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-2">
                <div className='w-full'>
                    <BookmarkSearchControls/>
                </div>
                <div className="flex flex-row gap-2">
                <Button
                    className={`shadow-xs border-input flex flex-row items-center gap-2 rounded-lg border bg-background px-2 py-1  ${
                        toggleFilterVisibility
                            ? 'border-accent-blue ring-1 ring-offset-background text-primary'
                            : 'text-gray-500 hover:bg-background-lighter'
                    }`}
                    onClick={() =>
                        setToggleFilterVisibility(!toggleFilterVisibility)
                    }
                >
                    <FilterLinesIcon width={16} />
                    <span>{t('filters')}</span>
                </Button>
                <Selector
                    isMultiselect={false}
                    selectedItems={filters}
                    setSelectedItems={setFilters}
                    options={sortingOptions}
                    hideCheckbox={true}
                    placeholder={t('proposals.options.sort')}
                />
                </div>
            </div>
        </div>
    );
};

export default BookmarkToolbar;
