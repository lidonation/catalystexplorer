import Button from '@/Components/atoms/Button';
import Selector from '@/Components/atoms/Selector';
import SearchBar from '@/Components/SearchBar';
import FilterLinesIcon from '@/Components/svgs/FilterLinesIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { Dispatch, SetStateAction, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ActiveFilters from './ActiveFilters';
import { router } from '@inertiajs/react';
import { VoteEnums } from '@/enums/vote-search-enums';

function SecondarySearchControls({
    onFiltersToggle,
    sortOptions,
    searchPlaceholder,
    searchParam = VoteEnums.QUERY,
    searchLabel = 'Search',
}: {
    onFiltersToggle: Dispatch<SetStateAction<boolean>>;
    sortOptions: Array<any>;
    searchPlaceholder?: string;
    searchParam?: string;
    searchLabel?: string;
}) {
    const { getFilter, setFilters, filters } = useFilterContext();
    const { t } = useTranslation();

    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(searchParam) || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        setSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    useEffect(() => {
        onFiltersToggle(showFilters);
    }, [showFilters, onFiltersToggle]);

    const handleSearch = (search: string) => {
        setFilters({
            param: searchParam,
            value: search,
            label: t(searchLabel === 'Search' ? 'vote.search' : searchLabel, searchLabel),
        });
        setSearchQuery(search);
        const url = new URL(window.location.href);

        if (search.trim() === '') {
            url.searchParams.delete(searchParam);
            router.get(window.location.pathname, {}, { replace: true });
        } else {
            setFilters({
                param: searchParam,
                value: search,
                label: t(searchLabel === 'Search' ? 'vote.search' : searchLabel, searchLabel),
            });
            url.searchParams.set(searchParam, search);
        }

        window.history.replaceState(null, '', url.toString());
    };

    const toggleFilters = useCallback(() => {
        setShowFilters(prev => !prev);
    }, []);

    const filtersCount = filters.filter(
        (filter) =>
            filter.param !== VoteEnums.PAGE && 
            filter.param !== VoteEnums.QUERY &&
            filter.param !== VoteEnums.SECONDARY_QUERY &&
            filter.value.length > 0,
    ).length;

    return (
        <div className="sticky px-0 top-0 z-10 container mx-auto flex w-full flex-col gap-3 py-3 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="w-full">
                    <SearchBar
                        handleSearch={handleSearch}
                        autoFocus
                        showRingOnFocus
                        initialSearch={searchQuery}
                        placeholder={searchPlaceholder}
                    />
                </div>
                <div className="flex flex-col xs:flex-row sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                        className={`border-input bg-background flex cursor-pointer w-full sm:w-auto flex-row items-center justify-center gap-2 rounded-lg border px-3 py-1.5 shadow-xs ${
                            showFilters
                                ? 'border-accent-blue text-primary ring-offset-background ring-1'
                                : 'hover:bg-background-lighter text-gray-persist'
                        }`}
                        onClick={toggleFilters}
                        ariaLabel={t('vote.showFilters')}
                    >
                        <FilterLinesIcon className={'size-6'} />
                        <span>{t('filters')}</span>
                        <span>({filtersCount})</span>
                    </Button>

                    <Selector
                        isMultiselect={false}
                        selectedItems={getFilter(VoteEnums.SORT)}
                        setSelectedItems={(value) =>
                            setFilters({
                                param: VoteEnums.SORT,
                                value,
                                label: t('vote.sort'),
                            })
                        }
                        options={sortOptions}
                        hideCheckbox={true}
                        placeholder={t('proposals.options.sort')}
                        className={`bg-background w-full sm:w-auto ${
                            getFilter(VoteEnums.SORT)
                                ? 'bg-background-lighter text-primary'
                                : 'hover:bg-background-lighter text-gray-persist'
                        }`}
                    />
                </div>
            </div>

            <div className="container mx-auto flex justify-start px-0">
                <ActiveFilters sortOptions={sortOptions} />
            </div>
        </div>
    );
}

export default SecondarySearchControls;
