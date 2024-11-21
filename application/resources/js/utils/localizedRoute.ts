import { useRoute } from 'ziggy-js';
import {usePage} from '@inertiajs/react';

export function useLocalizedRoute(name: string) {
    const route = useRoute();
    const { locale } = usePage().props;
    console.log( usePage().props);

    return route(`${locale||'en'}.${name}`);
};

