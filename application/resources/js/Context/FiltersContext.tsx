import { router } from '@inertiajs/react';
import {
    createContext,
    ReactNode,
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

    console.log({ tyty: filters, defaultFilters });

    const setFilters = <Key extends keyof K, S>(key: Key, value: S) => {
        setFiltersState((prev) => {
            if (prev[key] === value) return prev;

            return {
                ...prev,
                [key]: value,
            };
        });
    };

    const currentUrl = window.location.origin + window.location.pathname;

    useEffect(() => {
        // if (isFirstLoad.current) {
        //     isFirstLoad.current = false;
        //     return;
        // }

        const fetchData = async () => {
            router.get(currentUrl, filters, {
                preserveState: true,
                preserveScroll: true,
            });
            console.log('called');
        };

        fetchData();
    }, [filters]);

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
