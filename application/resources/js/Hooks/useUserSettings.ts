import { db } from '@/db/db';
import { useCallback, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';

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
    const [isLoading, setIsLoading] = useState(true);

  
    const userSetting = useLiveQuery(
        async () => {
            try {
                const setting = await db.user_setting.limit(1).first();
                setIsLoading(false);
                return setting;
            } catch (error) {
                console.error(`Failed to load user setting:`, error);
                setIsLoading(false);
                return null;
            }
        },
        [] 
    );


    const value = userSetting && userSetting[key] !== undefined && userSetting[key] !== null
        ? (userSetting[key] as T)
        : (defaultValue ?? null);

    const setValue = useCallback(async (newValue: T) => {
        try {
            let currentSetting = await db.user_setting.limit(1).first();

            if (!currentSetting) {
                currentSetting = {
                    language: 'en',
                    theme: null,
                    viewChartBy: null,
                    proposalComparison: null,
                };
            }

            const updatedSetting = {
                ...currentSetting,
                [key]: newValue,
            };

            await db.user_setting.put(updatedSetting);
        } catch (error) {
            console.error(`Failed to save user setting for ${key}:`, error);
        }
    }, [key]);

    return {
        value,
        setValue,
        isLoading,
    };
}