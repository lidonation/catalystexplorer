import Button from '@/Components/atoms/Button';
import Selector from '@/Components/atoms/Selector';
import SearchBar from '@/Components/SearchBar';
import FilterLinesIcon from '@/Components/svgs/FilterLinesIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { Dispatch, SetStateAction, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import ActiveFilters from '@/Components/atoms/ActiveFilters';

function SearchControls({
    onFiltersToggle,
    searchPlaceholder
}: {
    onFiltersToggle: Dispatch<SetStateAction<boolean>>;
    searchPlaceholder?: string;
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
        setShowFilters(prev => !prev);
    }, []);

    const filtersCount = filters.filter(
        (filter) =>
            filter.param !== ParamsEnum.PAGE && filter.value.length > 0,
    ).length;

    return (
        <div className="sticky px-0 top-0 z-10 container mx-auto flex w-full flex-col gap-3 py-3 backdrop-blur-md">
            <div className="flex items-center justify-end gap-2">
                <SearchBar
                    handleSearch={handleSearch}
                    autoFocus
                    showRingOnFocus
                    initialSearch={searchQuery}
                    placeholder={searchPlaceholder}
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
            </div>

            <div className="container mx-auto flex justify-start px-0">
                <ActiveFilters />
            </div>
        </div>
    );
}

export default SearchControls;
