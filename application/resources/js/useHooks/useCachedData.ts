import { useState, useEffect, useCallback, useRef } from 'react';
import storageService from '@/utils/storage-service';
import { StorageKeys } from '@/enums/storage-keys-enums';

interface UseCachedDataOptions<T> {
    key: StorageKeys;
    fetchFn: () => Promise<T>;
    ttlMs?: number;
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

export function useCachedData<T>({
    key,
    fetchFn,
    ttlMs = 7 * 24 * 60 * 60 * 1000,
    enabled = true,
    onSuccess,
    onError,
}: UseCachedDataOptions<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    
    useEffect(() => {
        onSuccessRef.current = onSuccess;
    }, [onSuccess]);
    
    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    const fetchData = useCallback(async (forceRefresh = false) => {
        if (!enabled) return;

        if (!forceRefresh) {
            const cached = storageService.getWithTTL<T>(key);
            if (cached) {
                setData(cached);
                return; 
            }
        }

        setLoading(true);
        setError(null);
        try {
            const newData = await fetchFn();
            setData(newData);
            
            if (ttlMs > 0) {
                storageService.saveWithTTL(key, newData, ttlMs);
            } else {
                storageService.save(key, newData);
            }
            
            onSuccessRef.current?.(newData);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            onErrorRef.current?.(error);
            
            const staleCache = storageService.get<T>(key);
            if (staleCache) {
                setData(staleCache);
                console.warn('Using stale cache due to API error');
            }
        } finally {
            setLoading(false);
        }
    }, [key, fetchFn, ttlMs, enabled]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [fetchData, enabled]);

    const refetch = useCallback(() => fetchData(true), [fetchData]);

    return {
        data,
        loading,
        error,
        refetch,
        clearCache: () => storageService.remove(key),
    };
}