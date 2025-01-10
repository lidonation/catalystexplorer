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
    defaultFilters: FilteredItem[];
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
            // const previousFilters = filtersRef.current || {};
            //  const prevValue = prev.find((item) => item.label == filter.label);

            //  if (prevValue?.value === filter.value) return prev;

            // const changedFilter = filters.filter((filter)=>{
            //     previousFilters.find
            //     filter.value

            // });

            // const changedKeys = Object.keys(filters).filter(
            //     (key) => filters[key] !== previousFilters[key],
            // );

            // if (changedKeys.length === 0) {
            //     return;
            // }

            filtersRef.current = filters;

            // todo
            // const paginationFiltered =
            //     changedKeys.includes(ProposalParamsEnum.PAGE) ||
            //     changedKeys.includes(ProposalParamsEnum.LIMIT);

            router.get(currentUrl, formatToParams(), {
                preserveState: true,
                preserveScroll: false,
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
