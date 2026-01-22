import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface QuickSearchProposal {
    id: string;
    title: string;
    slug: string;
    fund_label?: string;
    amount_requested?: number;
    currency?: string;
}

interface QuickSearchList {
    id: string;
    title: string;
    type?: string;
    items_count?: number;
}

interface QuickSearchResults {
    proposals: QuickSearchProposal[];
    lists: QuickSearchList[];
}

interface UseQuickSearchReturn {
    results: QuickSearchResults | null;
    isLoading: boolean;
    error: Error | null;
    search: (query: string) => void;
}

export function useQuickSearch(query: string): UseQuickSearchReturn {
    const [results, setResults] = useState<QuickSearchResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const search = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data } = await axios.get<QuickSearchResults>(
                '/api/internal/quick-search',
                {
                    params: { q: searchQuery },
                }
            );
            setResults(data);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(new Error(err.message));
            } else {
                setError(err instanceof Error ? err : new Error('Search failed'));
            }
            setResults(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        search(query);
    }, [query, search]);

    return {
        results,
        isLoading,
        error,
        search,
    };
}
