import { useLaravelReactI18n } from 'laravel-react-i18n';
import { toast } from 'react-toastify';
import eventBus from '@/utils/eventBus';
import { ErrorToastOptions } from './useGlobalErrorHandler';

/**
 *For Manually showing toast notifications throughout your app.
 */
const useToast = (defaultOptions?: Partial<ErrorToastOptions>) => {
    const { t } = useLaravelReactI18n();

    const baseOptions: ErrorToastOptions = {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        pauseOnHover: true,
        ...defaultOptions
    };

    const translateMessage = (message: string): string => {
        if (
            typeof message === 'string' &&
            /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9][a-zA-Z0-9_]*)+$/.test(message)
        ) {
            try {
                return t(message);
            } catch (error) {
                console.warn('Translation failed for key:', message, error);
                return message;
            }
        }
        return message;
    };

    const showSuccess = (message: string, options?: Partial<ErrorToastOptions>) => {
        const translatedMessage = translateMessage(message);
        toast.success(translatedMessage, {
            ...baseOptions,
            ...options,
            toastId: `success-${Date.now()}`,
        });
        
        // Also emit event for any listeners
        eventBus.emitSuccess(translatedMessage);
    };

    const showError = (message: string, options?: Partial<ErrorToastOptions>) => {
        const translatedMessage = translateMessage(message);
        toast.error(translatedMessage, {
            ...baseOptions,
            ...options,
            toastId: `error-${Date.now()}`,
        });
        
        // Also emit event for any listeners
        eventBus.emitError(translatedMessage);
    };

    const showWarning = (message: string, options?: Partial<ErrorToastOptions>) => {
        const translatedMessage = translateMessage(message);
        toast.warning(translatedMessage, {
            ...baseOptions,
            ...options,
            toastId: `warning-${Date.now()}`,
        });
        
        // Also emit event for any listeners
        eventBus.emitWarning(translatedMessage);
    };

    const showInfo = (message: string, options?: Partial<ErrorToastOptions>) => {
        const translatedMessage = translateMessage(message);
        toast.info(translatedMessage, {
            ...baseOptions,
            ...options,
            toastId: `info-${Date.now()}`,
        });
        
        // Also emit event for any listeners
        eventBus.emitInfo(translatedMessage);
    };

    const dismiss = (toastId?: string | number) => {
        toast.dismiss(toastId);
    };

    const dismissAll = () => {
        toast.dismiss();
    };

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismiss,
        dismissAll
    };
};

export default useToast;
