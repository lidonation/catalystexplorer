import { useRoute } from 'ziggy-js';
import { usePage } from '@inertiajs/react';

export function useLocalizedRoute(name: string, params?: Record<string, any>) {
    const route = useRoute();
    const { locale } = usePage().props;

    return route(`${locale || 'en'}.${name}`, params);
}

export function generateLocalizedRoute(
    name: string,
    params?: Record<string, any>,
    locale: string = 'en',
) {
    return route(`${locale}.${name}`, params);
}
