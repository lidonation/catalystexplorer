import { db } from '@/db/db';
import { useCallback, useEffect, useState } from 'react';

type UserSettingKey = keyof App.DataTransferObjects.UserSettingData;

interface UseUserSettingReturn<T> {
    value: T | null;
    setValue: (value: T) => Promise<void>;
    isLoading: boolean;
}

export function useUserSetting<T = any>(
    key: UserSettingKey,
    defaultValue?: T
): UseUserSettingReturn<T> {
    const [value, setValueState] = useState<T | null>(defaultValue ?? null);
    const [isLoading, setIsLoading] = useState(true);

    // Load value from IndexedDB
    const loadValue = useCallback(async () => {
        try {
            const userSetting = await db.user_setting.limit(1).first();
            
            if (userSetting && userSetting[key] !== undefined && userSetting[key] !== null) {
                setValueState(userSetting[key] as T);
            } else if (defaultValue !== undefined) {
                setValueState(defaultValue);
            }
        } catch (error) {
            console.error(`Failed to load user setting for ${key}:`, error);
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
            
            let userSetting = await db.user_setting.limit(1).first();
            
            if (!userSetting) {
                userSetting = {
                    language: 'en',
                    theme: null,
                    viewChartBy: null,
                    proposalComparison: null,
                };
            }

            const updatedSetting = {
                ...userSetting,
                [key]: newValue,
            };

            await db.user_setting.put(updatedSetting);
            setValueState(newValue);
        } catch (error) {
            console.error(`Failed to save user setting for ${key}:`, error);
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