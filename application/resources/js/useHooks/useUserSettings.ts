import { db } from '@/db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useState } from 'react';

type UserSettingKey = keyof App.DataTransferObjects.UserSettingData;

interface UseUserSettingReturn<T> {
    value: T | null;
    setValue: (value: T) => Promise<void>;
    isLoading: boolean;
}

export function useUserSetting<T = any>(
    key: UserSettingKey,
    defaultValue?: T,
    scope?: string,
): UseUserSettingReturn<T> {
    const [isLoading, setIsLoading] = useState(true);

    const userSetting = useLiveQuery(async () => {
        try {
            const setting = await db.user_setting.limit(1).first();
            setIsLoading(false);
            return setting;
        } catch (error) {
            console.error(`Failed to load user setting:`, error);
            setIsLoading(false);
            return null;
        }
    }, []);

    // Compute value with scope support
    const value = (() => {
        if (!userSetting) {
            return defaultValue ?? null;
        }

        const storedValue = userSetting[key];

        if (storedValue === undefined || storedValue === null) {
            return defaultValue ?? null;
        }

        if (!scope) {
            return storedValue as T;
        }

        if (typeof storedValue === 'object' && !Array.isArray(storedValue)) {
            const nested = storedValue as Record<string, T>;

            if (scope in nested) {
                return nested[scope];
            }
            if ('_default' in nested) {
                return nested['_default'];
            }
        }

        if (isConfiguratorState(storedValue)) {
            return storedValue as T;
        }

        return defaultValue ?? null;
    })();

    const setValue = useCallback(async (newValue: T) => {
        try {
            let currentSetting = await db.user_setting.limit(1).first();

            if (!currentSetting) {
                currentSetting = {
                    language: 'en',
                    theme: null,
                    viewChartBy: null,
                    proposalComparison: null,
                    proposalType: null,
                    chartOptions: null,
                    chartType: null,
                    viewHorizontal: false,
                    viewMini: false,
                    viewTable: false,
                    proposalPdfColumns: null,
                    groupByCategories: false,
                    preferredCurrency: 'ADA',
                };
            }

            let updatedValue: any = newValue;

            if (scope) {
                const existingValue = currentSetting[key];
                let nestedObject: Record<string, T> = {};

                if (existingValue && typeof existingValue === 'object' && !Array.isArray(existingValue)) {
        
                    if (!isConfiguratorState(existingValue)) {
                        nestedObject = { ...(existingValue as Record<string, T>) };
                    } else {
                        
                        nestedObject = { '_default': existingValue as T };
                    }
                }

                nestedObject[scope] = newValue;
                updatedValue = nestedObject;
            }

            const updatedSetting = {
                ...currentSetting,
                [key]: updatedValue,
            };

            await db.user_setting.put(updatedSetting);
        } catch (error) {
            console.error(`Failed to save user setting for ${key}:`, error);
        }
    }, [key, scope]);

    return {
        value,
        setValue,
        isLoading,
    };
}

/**
 * Type guard to check
 */
function isConfiguratorState(value: unknown): value is App.ShareCard.ConfiguratorState {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const obj = value as Record<string, unknown>;

    return (
        'visibleElements' in obj &&
        'selectedThemeId' in obj &&
        Array.isArray(obj.visibleElements)
    );
}
