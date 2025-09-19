import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import eventBus from '@/utils/eventBus';

interface PageProps {
    errorBags?: {
        default?: {
            [key: string]: string | string[];
        };
    };
    [key: string]: any;
}

export interface ErrorToastOptions {
    autoClose?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
    hideProgressBar?: boolean;
    closeOnClick?: boolean;
    draggable?: boolean;
    pauseOnHover?: boolean;
}

const useGlobalErrorHandler = (options?: ErrorToastOptions) => {
    const page = usePage<PageProps>();
    const { t } = useLaravelReactI18n();
    const previousErrorsRef = useRef<string>('');
    const previousUrlRef = useRef<string>('');
    const lastErrorTimestampRef = useRef<number>(0);

    const defaultOptions: ErrorToastOptions = {
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        pauseOnHover: true,
        ...options
    };

    const translateMessage = (message: string): string => {
        if (
            typeof message === 'string' &&
            /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9][a-zA-Z0-9_]*)+$/.test(message)
        ) {
            try {
                const translated = t(message);
                return translated;
            } catch (error) {
                console.warn('Translation failed for key:', message, error);
                return message;
            }
        }
        return message;
    };

    const processErrors = (errorBags: PageProps['errorBags']) => {
        if (!errorBags?.default || Object.keys(errorBags.default).length === 0) {
            return [];
        }

        return Object.entries(errorBags.default).flatMap(([key, messages]) =>
            Array.isArray(messages) 
                ? messages.map(msg => translateMessage(msg))
                : [translateMessage(messages)]
        );
    };

    const showErrorToasts = (errors: string[]) => {
        errors.forEach((error, index) => {
            // Use a slight delay between multiple toasts to prevent overlap
            setTimeout(() => {
                toast.error(error, {
                    ...defaultOptions,
                    toastId: `error-${index}-${Date.now()}`, // Prevent duplicate toasts
                });
            }, index * 100);
        });
    };

    const handleErrors = (errorBags: PageProps['errorBags']) => {
        const errors = processErrors(errorBags);
        const currentUrl = page.url;
        const currentTimestamp = Date.now();
        
        if (errors.length > 0) {
            // Create a hash of current errors to compare with previous
            const currentErrorsHash = JSON.stringify(errors.sort());
            
            const urlChanged = currentUrl !== previousUrlRef.current;
            const errorsChanged = currentErrorsHash !== previousErrorsRef.current;
            const timeSinceLastError = currentTimestamp - lastErrorTimestampRef.current;
            const enoughTimePassed = timeSinceLastError > 1000; // 1 second threshold
            
            if (errorsChanged || urlChanged || enoughTimePassed) {
                showErrorToasts(errors);
                
                // Emit event for other components that might want to listen
                eventBus.emit('errors:show', { errors, errorBags });
                
                previousErrorsRef.current = currentErrorsHash;
                previousUrlRef.current = currentUrl;
                lastErrorTimestampRef.current = currentTimestamp;
            }
        } else if (previousErrorsRef.current !== '') {
            // Errors were cleared
            eventBus.emit('errors:cleared');
            previousErrorsRef.current = '';
            previousUrlRef.current = currentUrl;
        }
    };

    useEffect(() => {
        handleErrors(page.props.errorBags);
    }, [page.props.errorBags, page.url]); // Also trigger on URL change to handle new page errors

    // Manual error show function for programmatic use
    const showError = (message: string, options?: Partial<ErrorToastOptions>) => {
        const translatedMessage = translateMessage(message);
        toast.error(translatedMessage, {
            ...defaultOptions,
            ...options,
            toastId: `manual-error-${Date.now()}`,
        });
    };

    const showSuccess = (message: string, options?: Partial<ErrorToastOptions>) => {
        const translatedMessage = translateMessage(message);
        toast.success(translatedMessage, {
            ...defaultOptions,
            ...options,
            toastId: `manual-success-${Date.now()}`,
        });
    };

    const showWarning = (message: string, options?: Partial<ErrorToastOptions>) => {
        const translatedMessage = translateMessage(message);
        toast.warning(translatedMessage, {
            ...defaultOptions,
            ...options,
            toastId: `manual-warning-${Date.now()}`,
        });
    };

    const showInfo = (message: string, options?: Partial<ErrorToastOptions>) => {
        const translatedMessage = translateMessage(message);
        toast.info(translatedMessage, {
            ...defaultOptions,
            ...options,
            toastId: `manual-info-${Date.now()}`,
        });
    };

    return {
        showError,
        showSuccess, 
        showWarning,
        showInfo,
        hasErrors: page.props.errorBags?.default && Object.keys(page.props.errorBags.default).length > 0
    };
};

export default useGlobalErrorHandler;
