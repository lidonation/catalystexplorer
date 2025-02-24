import { useState, useEffect } from 'react';
import requestManager from '@/utils/request-manager';
import ApiPaginatedData from '../../types/api-paginated-data';
import GroupFilters from '@/Pages/Groups/Partials/GroupFilters';

export function useSearchOptions<T>(domain?: string) {
    const [searchTerm, setSearchTerm] = useState('');
    const [hashes, setHashes] = useState<string[]>([]);
    const [options, setOptions] = useState<T[]>([]);

    // Helper to get the correct route name based on domain
    const getRouteName = (domain: string | undefined) => {
        switch (domain) {
            case 'ideascale-profiles':
                return 'api.ideascaleProfiles.index';
            default:
                return `api.${domain}`;
        }
    };

    const resolvePromise = async <T>(promise: Promise<T>): Promise<T | null> => {
        try {GroupFilters
            const response = await promise;
            
            return response;
        } catch (error) {
            console.error('Error resolving promise:', error);
            return null;
        }
    };

    useEffect(() => {

        const fetchData = async () => {
            const routeName = getRouteName(domain);
            const response = await resolvePromise<ApiPaginatedData<T>>(
                requestManager.sendRequest('get', route(routeName, { 
                    search: searchTerm, 
                    hashes: hashes
                }))
            );

            if (response) {
                const transformedData = (response?.data || response).map((item: any) => ({
                    ...item,
                    hash: item.hash || item.id
                }));
                setOptions(transformedData);
            }
        };

        if (searchTerm.length > 0 || hashes.length > 0) {
            fetchData();
        } else {
            setOptions([]);
        }
    }, [domain, searchTerm, hashes]);

    return { 
        searchTerm, 
        setSearchTerm, 
        options, 
        hashes,
        setHashes
    };
}