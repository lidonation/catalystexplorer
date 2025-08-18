import { useState, useEffect } from 'react';
import requestManager from '@/utils/request-manager';
import ApiPaginatedData from '../types/api-paginated-data';

export function useSearchOptions<T>(domain?: string) {
    const [searchTerm, setSearchTerm] = useState('');
    const [uuids, setUuids] = useState([]);
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
            let routeName = `api.${domain}`;

            if (domain === 'ideascale-profiles') {
                routeName = 'api.ideascaleProfiles.index'
            } else if (domain === 'funds') {
                routeName = 'api.funds.legacy'
            }

            const response = await resolvePromise<ApiPaginatedData<T>>(
                requestManager.sendRequest('get', route(routeName, { search: searchTerm, ids: uuids }))
            );

            if (response) {
                setOptions(response?.data || response);
            }
        };

        if (searchTerm.length || uuids.length) {
            fetchData();
        }


    }, [domain, searchTerm, uuids]);

    return { searchTerm, setSearchTerm, options, uuids, setUuids };
}
