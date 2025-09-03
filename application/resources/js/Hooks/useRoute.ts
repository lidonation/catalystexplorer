import { createContext, useContext } from 'react';
import { route } from 'ziggy-js';

export const RouteContext = createContext<typeof route | null>(null);

export default function useRoute(): typeof route {
    const fn = useContext(RouteContext);
    if (!fn) {
        throw new Error('Route function must be provided');
    }
    return fn;
}
