import Button from '@/Components/atoms/Button';
import Selector from '@/Components/atoms/Selector';
import SearchBar from '@/Components/SearchBar';
import FilterLinesIcon from '@/Components/svgs/FilterLinesIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { VoteEnums } from '@/enums/vote-search-enums';
import { router } from '@inertiajs/react';
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import ActiveFilters from './ActiveFilters/ActiveFilters';

function SecondarySearchControls({
    onFiltersToggle,
    sortOptions,
    searchPlaceholder,
    searchParam = VoteEnums.QUERY,
    searchLabel = 'Search',
    isUnifiedSearch = false,
}: {
    onFiltersToggle: Dispatch<SetStateAction<boolean>>;
    sortOptions: Array<any>;
    searchPlaceholder?: string;
    searchParam?: string;
    searchLabel?: string;
    isUnifiedSearch?: boolean;
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
            label: t(
                searchLabel === 'Search' ? 'vote.search' : searchLabel,
                searchLabel,
            ),
        });
        setSearchQuery(search);
        const url = new URL(window.location.href);
        const isUnified =
            isUnifiedSearch || url.searchParams.get('unifiedSearch') === 'true';
        if (isUnified) {
            url.searchParams.set('unifiedSearch', 'true');
        }
        if (search.trim() === '') {
            url.searchParams.delete(searchParam);
            router.get(window.location.pathname, {}, { replace: true });
        } else {
            setFilters({
                param: searchParam,
                value: search,
                label: t(
                    searchLabel === 'Search' ? 'vote.search' : searchLabel,
                    searchLabel,
                ),
            });
            url.searchParams.set(searchParam, search);
            if (isUnified) {
                const params: Record<string, string> = {};
                for (const [key, value] of url.searchParams.entries()) {
                    params[key] = value;
                }
                router.get(window.location.pathname, params, {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['voterHistories', 'filters'],
                    replace: true,
                });
            } else {
                window.history.replaceState(null, '', url.toString());
            }
        }
    };

    const toggleFilters = useCallback(() => {
        setShowFilters((prev) => !prev);
    }, []);

    const filtersCount = filters.filter(
        (filter) =>
            filter.param !== VoteEnums.PAGE &&
            filter.param !== VoteEnums.QUERY &&
            filter.param !== VoteEnums.SECONDARY_QUERY &&
            filter.value.length > 0,
    ).length;

    return (
        <div className="sticky top-0 z-10 container mx-auto flex w-full flex-col gap-3 px-0 py-3 backdrop-blur-md">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <div className="w-full">
                    <SearchBar
                        border={'border-dark-light'}
                        handleSearch={handleSearch}
                        autoFocus
                        showRingOnFocus
                        initialSearch={searchQuery}
                        placeholder={searchPlaceholder}
                    />
                </div>
                <div className="xs:flex-row flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button
                        className={`border-input bg-background flex w-full cursor-pointer flex-row items-center justify-center gap-2 rounded-lg border px-3 py-1.5 shadow-xs sm:w-auto ${
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
                        setSelectedItems={(value) => {
                            if (!value) {
                                setFilters({
                                    param: VoteEnums.SORT,
                                    value: null,
                                    label: undefined,
                                });

                                setTimeout(() => {
                                    const currentUrl = window.location.pathname;
                                    const currentParams = new URLSearchParams(
                                        window.location.search,
                                    );

                                    currentParams.delete(VoteEnums.SORT);
                                    currentParams.delete('sort');
                                    currentParams.delete('voting_power');

                                    const params: Record<string, string> = {};
                                    for (const [
                                        key,
                                        value,
                                    ] of currentParams.entries()) {
                                        if (value) {
                                            params[key] = value;
                                        }
                                    }

                                    router.get(currentUrl, params, {
                                        preserveState: true,
                                        preserveScroll: true,
                                        only: ['voterHistories', 'filters'],
                                    });
                                }, 10);
                            } else {
                                setFilters({
                                    param: VoteEnums.SORT,
                                    value,
                                    label: t('vote.sort'),
                                });
                            }
                        }}
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
                <ActiveFilters sortOptions={sortOptions} filters={filters} setFilters={setFilters} />
            </div>
        </div>
    );
}

export default SecondarySearchControls;
