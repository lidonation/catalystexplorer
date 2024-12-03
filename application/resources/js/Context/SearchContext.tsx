import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
    loading: boolean;
    cache: Record<string, any[]>;
    setLoading: (isLoading: boolean) => void;
    setCache: (key: string, options: any[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(false);
    const [cache, setCacheState] = useState<Record<string, any[]>>({});

    const setCache = (key: string, options: any[]) => {
        setCacheState((prev) => ({
            ...prev,
            [key]: options,
        }));
    };

    return (
        <SearchContext.Provider
            value={{ loading, cache, setLoading, setCache }}
        >
            {children}
        </SearchContext.Provider>
    );
};

export const useSearchContext = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error(
            'useSearchContext must be used within a SearchProvider',
        );
    }
    return context;
};
