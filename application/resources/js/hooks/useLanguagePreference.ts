import { useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { PageProps, User } from '@/types/index';

export const useLanguagePreference = () => {
    const { setLocale } = useLaravelReactI18n();
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

    const updateUserLanguagePreference = useCallback(async (language: string) => {
        try {
            const endpoint = user ? '/language/user' : '/language/guest';
            
            // Get CSRF token for the request
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ language })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to update language preference: ${JSON.stringify(errorData)}`);
            }
            
            // Update the local locale
            setLocale(language);
            
            // For authenticated users, reload user data via Inertia
            if (user) {
                router.reload({ only: ['auth'] });
            }
            
        } catch (error) {
            console.error('Error updating language preference:', error);
            throw error;
        }
    }, [user, setLocale]);

    const getCurrentUserLanguage = useCallback((): string => {
        return user?.lang || 'en';
    }, [user]);

    return {
        updateUserLanguagePreference,
        getCurrentUserLanguage,
        isAuthenticated: !!user,
    };
};