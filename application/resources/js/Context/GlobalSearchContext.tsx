import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface GlobalSearchContextType {
    isOpen: boolean;
    query: string;
    openSearch: () => void;
    closeSearch: () => void;
    toggleSearch: () => void;
    setQuery: (query: string) => void;
    clearQuery: () => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextType | null>(null);

interface GlobalSearchProviderProps {
    children: ReactNode;
}

export const GlobalSearchProvider = ({ children }: GlobalSearchProviderProps) => { 
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQueryState] = useState('');

    const openSearch = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeSearch = useCallback(() => {
        setIsOpen(false);
        setQueryState('');
    }, []);

    const toggleSearch = useCallback(() => {
        setIsOpen((prev) => {
            if (prev) {
                setQueryState('');
            }
            return !prev;
        });
    }, []);

    const setQuery = useCallback((newQuery: string) => {
        setQueryState(newQuery);
    }, []);

    const clearQuery = useCallback(() => {
        setQueryState('');
    }, []);

    return (
        <GlobalSearchContext.Provider
            value={{
                isOpen,
                query,
                openSearch,
                closeSearch,
                toggleSearch,
                setQuery,
                clearQuery,
            }}
        >
            {children}
        </GlobalSearchContext.Provider>
    );
}

export const useGlobalSearch = (): GlobalSearchContextType => {
    const context = useContext(GlobalSearchContext);
    if (!context) {
        throw new Error('useGlobalSearch must be used within a GlobalSearchProvider');
    }
    return context;
}