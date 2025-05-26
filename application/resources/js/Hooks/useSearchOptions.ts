import { useState, useEffect } from 'react';
import requestManager from '@/utils/request-manager';
import ApiPaginatedData from '../types/api-paginated-data';

export function useSearchOptions<T>(domain?: string) {
    const [searchTerm, setSearchTerm] = useState('');
    const [hashes, setHashes] = useState([]);
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
            const routeName = domain === 'ideascale-profiles'
                ? 'api.ideascaleProfiles.index'
                : `api.${domain}`;


            const response = await resolvePromise<ApiPaginatedData<T>>(
                requestManager.sendRequest('get', route(routeName, { search: searchTerm, hashes }))
            );

            if (response) {
                setOptions(response?.data || response);
            }
        };

        if (searchTerm.length || hashes.length) {
            fetchData();
        }


    }, [domain, searchTerm, hashes]);

    return { searchTerm, setSearchTerm, options, hashes, setHashes };
}
