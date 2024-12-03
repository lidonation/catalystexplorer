import { useState, useEffect } from 'react';
import requestManager from '@/utils/request-manager';

export function useSearchOptions(domain?:string) {
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState([]);

    const resolvePromise = async (promise: Promise<void>) => {
        try {
            const response = await promise;
            return response; // Resolves the promise and returns the result
        } catch (error) {
            console.error('Error resolving promise:', error);
            return null; // Handle the error gracefully
        }
    };

    useEffect( () => {
        const fetchData = async () => {
            const response = await resolvePromise(
                requestManager.sendRequest('get', route(`api.${domain}`, { search: searchTerm }))
            );

            if (response) {
                setOptions(response?.data); // Update state only if the response is successful
            }
        };
        
        if (searchTerm.length>1) {
            fetchData();
        }
    }, [domain, searchTerm]);

    return { searchTerm, setSearchTerm, options };
}