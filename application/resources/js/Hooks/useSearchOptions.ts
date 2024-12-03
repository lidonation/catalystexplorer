import { useState, useEffect } from 'react';
import requestManager from '@/utils/request-manager';
import ApiPaginatedData from '../../types/api-paginated-data';

export function useSearchOptions<T>(domain?: string) {
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState<T[]>([]);

    const resolvePromise = async <T>(promise: Promise<T>): Promise<T | null> => {
        try {
            const response = await promise;
            return response;
        } catch (error) {
            console.error('Error resolving promise:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await resolvePromise<ApiPaginatedData<T>>(
                requestManager.sendRequest('get', route(`api.${domain}`, { search: searchTerm }))
            );

            if (response) {
                setOptions(response?.data);
            }
        };

        if (searchTerm.length > 1) {
            fetchData();
        }
    }, [domain, searchTerm]);

    return { searchTerm, setSearchTerm, options };
}