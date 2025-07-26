import {Config, useRoute} from 'ziggy-js';
import { usePage } from '@inertiajs/react';

export function useLocalizedRoute(name: string, params?: Record<string, any>) {
    const { locale, ziggy } = usePage().props as any;
    const route = useRoute(ziggy as Config);

    return route(`${locale || 'en'}.${name}`, params);
}

export function generateLocalizedRoute(
    name: string,
    params?: Record<string, any>,
    locale: string = 'en',
) {
    return route(`${locale}.${name}`, params);
}
