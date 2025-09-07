import { usePage } from '@inertiajs/react';
import { Config, useRoute } from 'ziggy-js';

export function useLocalizedRoute(name: string, params?: Record<string, any>) {
    const { locale, ziggy } = usePage().props as any;
    const route = useRoute(ziggy as Config);
    const routeName = `${locale || 'en'}.${name}`;
    
    try {
        return route(routeName, params);
    } catch (error) {
        console.warn(`Route '${routeName}' not found, falling back to 'en.${name}'`);
        return route(`en.${name}`, params);
    }
}

export function generateLocalizedRoute(
    name: string,
    params?: Record<string, any>,
    locale: string = 'en',
) {
    return route(`${locale}.${name}`, params);
}
