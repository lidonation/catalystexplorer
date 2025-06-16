import { db } from '@/db/db';
import { useCallback, useEffect, useState } from 'react';

interface UseKeyValueStoreReturn<T> {
    value: T | null;
    setValue: (value: T) => Promise<void>;
    isLoading: boolean;
}

export function useKeyValueStore<T = any>(
    key: string,
    defaultValue?: T
): UseKeyValueStoreReturn<T> {
    const [value, setValueState] = useState<T | null>(defaultValue ?? null);
    const [isLoading, setIsLoading] = useState(true);

    // Load value from IndexedDB
    const loadValue= useCallback(async () => {
        try {
            const preference = await db.key_value_store
                .where('key')
                .equals(key)
                .first();
            
            if (preference) {
                const parsedValue = JSON.parse(preference.value);
                setValueState(parsedValue);
            } else if (defaultValue !== undefined) {
                setValueState(defaultValue);
            }
        } catch (error) {
            console.error('Failed to load user preference:', error);
            if (defaultValue !== undefined) {
                setValueState(defaultValue);
            }
        } finally {
            setIsLoading(false);
        }
    }, [key, defaultValue]);

    // Save value to IndexedDB
    const setValue = useCallback(async (newValue: T) => {
        try {
            const preference: App.DataTransferObjects.KeyValueStoreData = {
                id: key,
                key,
                value: JSON.stringify(newValue),
                updated_at: new Date().toISOString(),
            };

            await db.key_value_store.put(preference);
            setValueState(newValue);
        } catch (error) {
            console.error('Failed to save user preference:', error);
        }
    }, [key]);

    useEffect(() => {
        loadValue();
    }, [loadValue]);

    return {
        value,
        setValue,
        isLoading,
    };
}