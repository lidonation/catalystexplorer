import Button from '@/Components/atoms/Button';
import Selector from '@/Components/atoms/Selector';
import SearchBar from '@/Components/SearchBar';
import FilterLinesIcon from '@/Components/svgs/FilterLinesIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react';
import ActiveFilters from './ActiveFilters/ActiveFilters';

function SearchControls({
    onFiltersToggle,
    sortOptions,
    searchPlaceholder,
    border,
    withFilters = true,
    withActiveTags = true,
}: {
    onFiltersToggle: Dispatch<SetStateAction<boolean>>;
    sortOptions: Array<any>;
    searchPlaceholder?: string;
    border?: null | string;
    withFilters?: boolean;
    withActiveTags?: boolean;
}) {
    const { getFilter, setFilters, filters } = useFilterContext();
    const { t } = useLaravelReactI18n();

    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(ParamsEnum.QUERY) || '';
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

    const toggleFilters = useCallback(() => {
        setShowFilters((prev) => !prev);
    }, []);

    const filtersCount = filters.filter(
        (filter) => filter.param !== ParamsEnum.PAGE && filter.value.length > 0,
    ).length;

    return (
        <div
            className="sticky top-0 z-10 mx-auto flex w-full flex-col gap-3 px-0 py-3 backdrop-blur-md"
            data-testid="search-controls-container"
        >
            <div className="flex flex-col items-center justify-end gap-2 lg:flex-row">
                <SearchBar
                    border={'border-gray-300'}
                    handleSearch={handleSearch}
                    autoFocus
                    showRingOnFocus
                    initialSearch={searchQuery}
                    placeholder={searchPlaceholder}
                />

                <div className="flex gap-2 max-sm:w-full max-sm:justify-between">
                    {withFilters && (
                        <Button
                            className={`border-input bg-background flex cursor-pointer flex-row items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm transition-all duration-200 ${
                                showFilters
                                    ? 'ring-offset-background border-gray-400 bg-gray-50 text-gray-700 ring-1 ring-gray-300'
                                    : 'text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                            }`}
                            onClick={toggleFilters}
                            ariaLabel="Show Filters"
                            dataTestId="search-controls-toggle-filters"
                        >
                            <FilterLinesIcon className={'size-5'} />
                            <span className="font-medium">{t('filters')}</span>
                        </Button>
                    )}
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
                        data-testid="search-controls-sort-selector"
                    />
                </div>
            </div>

            {withActiveTags && (
                <div className="container mx-auto flex justify-start px-0">
                    <ActiveFilters
                        sortOptions={sortOptions}
                        filters={filters}
                        setFilters={setFilters}
                    />
                </div>
            )}
        </div>
    );
}

export default SearchControls;
