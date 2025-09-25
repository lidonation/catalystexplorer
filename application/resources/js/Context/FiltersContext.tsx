import { ParamsEnum } from '@/enums/proposal-search-params';
import { router } from '@inertiajs/react';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { SearchParams } from '../types/search-params';

export interface FilteredItem {
    param: string;
    label?: string;
    value?: any;
    resetPageOnChange?: boolean;
}

interface FilterContextType {
    filters: FilteredItem[];
    setFilters: (filter: FilteredItem) => void;
    getFilter: (param: string) => any;
    getFilters: (filter: FilteredItem) => string;
}

const labels = {
    b: 'Budgets',
    f: 'Funds',
    fs: 'Funding Status',
    pl: 'Project Length',
    ps: 'Project Status',
    op: 'Opensource',
    t: 'Tags',
    cam: 'Campaign',
    coh: 'Cohort',
    com: 'Communities',
    ip: 'Ideascale Profiles',
    g: 'Groups',
    pro: 'Proposals',
    ri: 'Reviewer IDs',
    h: 'Helpful',
    r: 'Ratings',
    rs: 'Reputation Score',
};

type LabelKeys = keyof typeof labels;

const formatToFilters = (paramObj: Record<LabelKeys, any>): FilteredItem[] => {
    return Object.keys(paramObj).map((param) => {
        const typedParam = param as LabelKeys;
        return {
            param: typedParam,
            label: labels[typedParam],
            value: paramObj[typedParam],
        };
    });
};

const FiltersContext = createContext<FilterContextType | undefined>(undefined);

export function FiltersProvider({
    children,
    defaultFilters,
    routerOptions = {},
}: {
    children: ReactNode;
    defaultFilters: SearchParams;
    routerOptions?: Record<string, any>;
}) {
    const initialFilters = formatToFilters(defaultFilters);
    const [filters, setFiltersState] = useState<FilteredItem[]>(initialFilters);

    const isFirstLoad = useRef(true);
    const pendingRequestRef = useRef<NodeJS.Timeout | null>(null);

    const updateFilter = (
        updatedFilters: FilteredItem[],
        filter: FilteredItem,
    ) => {
        if (!filter?.value) {
            updatedFilters = updatedFilters.filter(
                (item) => item.param !== filter.param,
            );
        } else {
            updatedFilters = updatedFilters.filter(
                (item) => item.param !== filter.param,
            );
            updatedFilters.push(filter);
        }

        return updatedFilters;
    };

    const setFilters = useCallback((filter: FilteredItem) => {
        setFiltersState((prev: FilteredItem[]) => {
            const prevValue = prev.find((item) => item.param === filter.param);

            // If the new filter value matches the previous value, return the same state
            if (prevValue?.value === filter.value) {
                return prev;
            }

            // Create a new array to avoid mutating the previous state
            let updated = updateFilter([...prev], filter);

            const shouldResetPage =
                filter.param !== ParamsEnum.PAGE &&
                filter.resetPageOnChange !== false;

            if (shouldResetPage) {
                updated = updateFilter(updated, {
                    param: ParamsEnum.PAGE,
                    label: 'Current Page',
                    value: 1,
                });
            }

            return updated;
        });
    }, []);

    const currentUrl = window.location.origin + window.location.pathname;

    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        if (pendingRequestRef.current) {
            clearTimeout(pendingRequestRef.current);
        }

        pendingRequestRef.current = setTimeout(() => {
            const previousFilters = filtersRef.current || [];

            const changedFilters = filters.filter((filter) => {
                const previousFilter = previousFilters.find(
                    (prev) => prev.param === filter.param,
                );

                return !previousFilter || previousFilter.value !== filter.value;
            });

            const changedParams = changedFilters.map((filter) => filter.param);

            if (changedParams.length === 0) {
                return;
            }

            filtersRef.current = filters;

            const paginationFiltered =
                changedParams.includes(ParamsEnum.PAGE) ||
                changedParams.includes(ParamsEnum.LIMIT);

            const shouldPreserveScroll = !changedParams.includes(ParamsEnum.PAGE);

            router.get(currentUrl, formatToParams(), {
                preserveState: true,
                preserveScroll: shouldPreserveScroll,
                ...routerOptions,
            });
        }, 50);

        return () => {
            if (pendingRequestRef.current) {
                clearTimeout(pendingRequestRef.current);
                pendingRequestRef.current = null;
            }
        };
    }, [filters, routerOptions]);

    const formatToParams = (externalFilters?: FilteredItem[]) => {
        return (externalFilters || filters).reduce<Record<string, any>>(
            (acc, item) => {
                acc[item.param] = item.value || null;
                return acc;
            },
            {},
        );
    };

    const filtersRef = useRef(filters);

    const getFilter = (param: string) => {
        return filters.find((filter) => filter.param == param)?.value;
    };

    const getFilters = (filter: FilteredItem) => {
        // Create a new array to avoid mutating the previous state
        const updatedFilters = updateFilter([...filters], filter);
        // const currentUrl = window.location.origin + window.location.pathname;
        const queryString = new URLSearchParams(
            formatToParams(updatedFilters),
        ).toString();

        return `${window.location.pathname}?${queryString}`;
    };

    return (
        <FiltersContext.Provider
            value={{ filters, setFilters, getFilter, getFilters }}
        >
            {children}
        </FiltersContext.Provider>
    );
}

export function useFilterContext() {
    const context = useContext(FiltersContext);
    if (!context) {
        throw new Error(
            'useFilterContext must be used within a FiltersProvider',
        );
    }
    return context;
}
