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
import { SearchParams } from '../../types/search-params';

export interface FilteredItem {
    param: string;
    label?: string;
    value?: any;
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

    const updateFilter = (
        updatedFilters: FilteredItem[],
        filter: FilteredItem,
    ) => {
        // First, remove the existing filter
        updatedFilters = updatedFilters.filter(
            (item) => item.param !== filter.param,
        );
        
        // Check if value is effectively empty (null, undefined, empty string, or empty array)
        const isEmptyValue = 
            filter.value === null || 
            filter.value === undefined || 
            filter.value === '' || 
            (Array.isArray(filter.value) && filter.value.length === 0);
        
        // Only add the filter back if it's not empty
        if (!isEmptyValue) {
            updatedFilters.push(filter);
        }
    
        return updatedFilters;
    };

    const setFilters = useCallback((filter: FilteredItem) => {
        setFiltersState((prev: FilteredItem[]) => {
            const prevFilter = prev.find((item) => item.param === filter.param);

            const areValuesEqual = (val1: any, val2: any) => {
                if (Array.isArray(val1) && Array.isArray(val2)) {
                    if (val1.length !== val2.length) return false;
                    const sortedVal1 = [...val1].sort();
                    const sortedVal2 = [...val2].sort();
                    return sortedVal1.every((val, idx) => val === sortedVal2[idx]);
                }
                
                if (typeof val1 === 'string' && typeof val2 === 'string') {
                    const arr1 = val1.split(',').filter(Boolean).sort();
                    const arr2 = val2.split(',').filter(Boolean).sort();
                    if (arr1.length !== arr2.length) return false;
                    return arr1.every((val, idx) => val === arr2[idx]);
                }
                
                return val1 === val2;
            };
            
            // If the new filter value matches the previous value, return the same state
            if (prevFilter && areValuesEqual(prevFilter.value, filter.value)) {
                return prev;
            }

            // Create a new array to avoid mutating the previous state
            let updated = updateFilter([...prev], filter);
            
            return updated;
        });
    }, []);

    const currentUrl = window.location.origin + window.location.pathname;

    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        const fetchData = async () => {
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
            router.get(currentUrl, formatToParams(), {
                preserveState: true,
                preserveScroll: !paginationFiltered,
                ...routerOptions,
            });
        };

        fetchData().then();
    }, [filters]);

    const formatToParams = (externalFilters?: FilteredItem[]) => {
        return (externalFilters || filters).reduce<Record<string, any>>(
            (acc, item) => {
                const isEmpty = 
                    item.value === null || 
                    item.value === undefined || 
                    item.value === '' || 
                    (Array.isArray(item.value) && item.value.length === 0);
                    
                if (!isEmpty) {
                    acc[item.param] = item.value;
                }
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
        let updatedFilters = updateFilter([...filters], filter);
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
