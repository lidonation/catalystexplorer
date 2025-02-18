import Button from '@/Components/atoms/Button';
import Selector from '@/Components/atoms/Selector';
import SearchBar from '@/Components/SearchBar';
import FilterLinesIcon from '@/Components/svgs/FilterLinesIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActiveFilters from './ActiveFilters';
import { router } from '@inertiajs/react';

function SearchControls({
    onFiltersToggle,
    sortOptions,
}: {
    onFiltersToggle: Dispatch<SetStateAction<boolean>>;
    sortOptions: Array<any>;
}) {
    const { getFilter, setFilters, filters } = useFilterContext();
    const { t } = useTranslation();

    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(ParamsEnum.QUERY) || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        setSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    const handleSearch = (search: string) => {
        setFilters({
            param: ParamsEnum.QUERY,
            value: search,
            label: 'Search',
        });
        setSearchQuery(search);
        const url = new URL(window.location.href);

        if (search.trim() === '') {
            url.searchParams.delete(ParamsEnum.QUERY);
            router.get(window.location.pathname, {}, { replace: true });
        } else {
            setFilters({
                param: ParamsEnum.QUERY,
                value: search,
                label: 'Search',
            });
            url.searchParams.set(ParamsEnum.QUERY, search);
        }

        window.history.replaceState(null, '', url.toString());
    };

    const toggleFilters = () => {
        setShowFilters((prev) => {
            const newState = !prev;
            onFiltersToggle(newState);
            return newState;
        });
    };

    const filtersCount = filters.filter(
        (filter) =>
            filter.param !== ParamsEnum.PAGE && filter.value.length > 0,
    ).length;

    return (
        <div className="sticky top-0 z-10 container mx-auto flex w-full flex-col gap-3 py-3 backdrop-blur-md">
            <div className="flex items-center justify-end gap-2">
                <SearchBar
                    handleSearch={handleSearch}
                    autoFocus
                    showRingOnFocus
                    initialSearch={searchQuery}
                />
                <Button
                    className={`border-input bg-background flex cursor-pointer flex-row items-center gap-2 rounded-lg border px-3 py-1.5 shadow-xs ${
                        showFilters
                            ? 'border-accent-blue text-primary ring-offset-background ring-1'
                            : 'hover:bg-background-lighter text-gray-500'
                    }`}
                    onClick={toggleFilters}
                    ariaLabel="Show Filters"
                >
                    <FilterLinesIcon className={'size-6'} />
                    <span>{t('filters')}</span>
                    <span>({filtersCount})</span>
                </Button>

                <Selector
                    isMultiselect={false}
                    selectedItems={getFilter(ParamsEnum.SORTS)}
                    setSelectedItems={(value) =>
                        setFilters({
                            param: ParamsEnum.SORTS,
                            value,
                            label: 'Sorts',
                        })
                    }
                    options={sortOptions}
                    hideCheckbox={true}
                    placeholder={t('proposals.options.sort')}
                    className={`bg-background ${
                        getFilter(ParamsEnum.SORTS)
                            ? 'bg-background-lighter text-primary'
                            : 'hover:bg-background-lighter text-gray-500'
                    }`}
                />
            </div>

            <div className="container mx-auto flex justify-start px-0">
                <ActiveFilters sortOptions={sortOptions} />
            </div>
        </div>
    );
}

export default SearchControls;
