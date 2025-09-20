import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

interface PageProps {
    intendedUrl?: string;
    [key: string]: any;
}

/**
 * Hook for managing intended URLs for redirects after authentication
 */
export const useIntendedUrl = () => {
    const { props } = usePage<PageProps>();

    const intendedUrl = useMemo(() => {
        if (props.intendedUrl) {
            return props.intendedUrl;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const queryIntended = urlParams.get('intended');
        if (queryIntended) {
            return queryIntended;
        }

        try {
            const storedIntended = localStorage.getItem('catalyst_intended_url');
            if (storedIntended && isValidUrl(storedIntended)) {
                return storedIntended;
            }
        } catch (error) {
            console.warn('Could not access localStorage for intended URL');
        }

        return null;
    }, [props.intendedUrl]);

    const setIntendedUrl = (url: string) => {
        if (!url || !isValidUrl(url)) {
            return;
        }

        try {
            localStorage.setItem('catalyst_intended_url', url);
        } catch (error) {
            console.warn('Could not save intended URL to localStorage');
        }
    };

    const clearIntendedUrl = () => {
        try {
            localStorage.removeItem('catalyst_intended_url');
        } catch (error) {
            console.warn('Could not clear intended URL from localStorage');
        }
    };

    const buildLoginUrlWithIntended = (currentUrl?: string) => {
        const baseLoginUrl = route('login');
        const targetUrl = currentUrl || window.location.href;
        
        if (!isValidUrl(targetUrl) || isAuthRelatedUrl(targetUrl)) {
            return baseLoginUrl;
        }

        setIntendedUrl(targetUrl);
        
        const loginUrl = new URL(baseLoginUrl, window.location.origin);
        loginUrl.searchParams.set('intended', targetUrl);
        
        return loginUrl.toString();
    };

    return {
        intendedUrl,
        setIntendedUrl,
        clearIntendedUrl,
        buildLoginUrlWithIntended,
    };
};

/**
 * Validate that a URL is safe for redirection
 */
function isValidUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url, window.location.origin);
        
        if (parsedUrl.origin !== window.location.origin) {
            return false;
        }

        return !isAuthRelatedUrl(parsedUrl.pathname);
    } catch {
        return false;
    }
}

/**
 * Check if URL is auth-related (should not be redirect target)
 */
function isAuthRelatedUrl(path: string): boolean {
    const authPaths = ['/login', '/register', '/logout', '/password', '/email'];
    
    return authPaths.some(authPath => {
        return path.startsWith(authPath) || 
               /^\/[a-z]{2}/.test(path) && path.includes(authPath);
    });
}

// Helper function to get route (assumes Laravel routes are available globally)
declare global {
    interface Window {
        route: (name: string, params?: any) => string;
    }
}

function route(name: string): string {
    if (typeof window.route === 'function') {
        return window.route(name);
    }
    
    const locale = document.documentElement.lang || 'en';
    return `/${locale}/${name}`;
}
