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

interface FilterContextType<K extends Record<string, any>> {
    filters: K;
    setFilters: <Key extends keyof K>(key: Key, value: K[Key]) => void;
}

const FiltersContext = createContext<FilterContextType<any> | any>(undefined);

export function FiltersProvider<K extends Record<string, any>>({
    children,
    defaultFilters,
}: {
    children: ReactNode;
    defaultFilters: K;
}) {
    const [filters, setFiltersState] = useState<K>(defaultFilters);
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (JSON.stringify(filters) !== JSON.stringify(defaultFilters)) {
            setFiltersState(defaultFilters);
        }
    }, [defaultFilters]);

    const setFilters = useCallback(
        <Key extends keyof K, S>(key: Key, value: S) => {
            setFiltersState((prev) => {
                if (prev[key] === value) return prev;

                return {
                    ...prev,
                    [key]: value,
                };
            });
        },
        [],
    );

    const currentUrl = window.location.origin + window.location.pathname;

    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        const fetchData = async () => {
            const previousFilters = filtersRef.current || {};
            const changedKeys = Object.keys(filters).filter(
                (key) => filters[key] !== previousFilters[key],
            );

            if (changedKeys.length === 0) {
                return;
            }

            filtersRef.current = { ...filters };

            const paginationFiltered =
                changedKeys.includes(ProposalParamsEnum.PAGE) ||
                changedKeys.includes(ProposalParamsEnum.LIMIT);


            router.get(currentUrl, filters, {
                preserveState: true,
                preserveScroll: !paginationFiltered,
            });
        };
        
        fetchData();
    }, [filters]);

    const filtersRef = useRef(filters);

    return (
        <FiltersContext.Provider value={{ filters, setFilters }}>
            {children}
        </FiltersContext.Provider>
    );
}

export function useFilterContext<K extends Record<string, any>>() {
    const context: FilterContextType<K> = useContext(FiltersContext);
    if (!context) {
        throw new Error(
            'useFilterContext must be used within a FiltersProvider',
        );
    }
    return context;
}
