import { ProposalParamsEnum } from '@/enums/proposal-search-params';
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
import { ProposalSearchParams } from '../../types/proposal-search-params';

export interface FilteredItem {
    param: string;
    label?: string;
    value?: any;
}

interface FilterContextType {
    filters: FilteredItem[];
    setFilters: (filter: FilteredItem) => void;
    getFilter: (param: string) => any;
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

const formatToFillters = (paramObj: { [x: string]: any }): FilteredItem[] => {
    return Object.keys(paramObj).map(
        (param): FilteredItem => ({
            param: param,
            label: labels[param],
            value: paramObj[param],
        }),
    );
};

const FiltersContext = createContext<FilterContextType | undefined>(undefined);

export function FiltersProvider({
    children,
    defaultFilters,
}: {
    children: ReactNode;
    defaultFilters: ProposalSearchParams;
}) {
    const initialFilters = formatToFillters(defaultFilters);
    const [filters, setFiltersState] = useState<FilteredItem[]>(initialFilters);

    const isFirstLoad = useRef(true);

    const setFilters = useCallback((filter: FilteredItem) => {
        setFiltersState((prev: FilteredItem[]) => {
            const prevValue = prev.find((item) => item.param === filter.param);

            console.log({ prevValue, filter });

            // If the new filter value matches the previous value, return the same state
            if (prevValue?.value === filter.value) {
                return prev;
            }

            // Create a new array to avoid mutating the previous state
            let updatedFilters = [...prev];

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
        });
    }, []);

    const currentUrl = window.location.origin + window.location.pathname;

    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        const fetchData = async () => {
            // todo
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
                changedParams.includes(ProposalParamsEnum.PAGE) ||
                changedParams.includes(ProposalParamsEnum.LIMIT);

            router.get(currentUrl, formatToParams(), {
                preserveState: true,
                preserveScroll: !paginationFiltered,
            });
        };

        fetchData();
    }, [filters]);

    const formatToParams = () => {
        return filters.reduce<Record<string, any>>((acc, item) => {
            acc[item.param] = item.value || null;
            return acc;
        }, {});
    };

    const filtersRef = useRef(filters);

    const getFilter = (param: string) => {
        return filters.find((filter) => filter.param == param)?.value;
    };

    return (
        <FiltersContext.Provider value={{ filters, setFilters, getFilter }}>
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
