import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import requestManager from '@/utils/request-manager';
import ApiPaginatedData from '../types/api-paginated-data';
import { ParamsEnum } from '@/enums/proposal-search-params';

export function useSearchOptions<T>(domain?: string, fundId?: string | null) {
   
    const searchTermKey = `searchTerm-${domain}`;
    const optionsKey = `options-${domain}`;

    const restoredSearchTerm = router.restore(searchTermKey);
    const restoredOptions = router.restore(optionsKey);
    
    const [searchTerm, setSearchTerm] = useState<string>(typeof restoredSearchTerm === 'string' ? restoredSearchTerm : '');
    const [uuids, setUuids] = useState([]);
    const [options, setOptions] = useState<T[]>(Array.isArray(restoredOptions) ? restoredOptions : []);

    const resolvePromise = async <T>(promise: Promise<T>): Promise<T | null> => {
        try {
            return await promise;
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

            const queryParams: Record<string, any> = { 
                search: searchTerm, 
                ids: uuids 
            };

            if (domain === 'proposals' && fundId) {
                queryParams[ParamsEnum.FUNDS] = fundId;
            }

            const response = await resolvePromise<ApiPaginatedData<T>>(
                requestManager.sendRequest('get', route(routeName, queryParams))
            );

            if (response) {
                setOptions(response?.data || response);
            }
        };

        if (searchTerm.length || uuids.length) {
            fetchData().then();
        }


    }, [domain, searchTerm, uuids, fundId]);

    // Remember searchTerm and options when they change
    useEffect(() => {
        // Debounce
        const timeoutId = setTimeout(() => {
            router.remember(searchTerm, searchTermKey);
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }, [searchTerm, searchTermKey]);

    useEffect(() => {
        router.remember(options, optionsKey);
    }, [options, optionsKey]);

    return { searchTerm, setSearchTerm, options, uuids, setUuids };
}
