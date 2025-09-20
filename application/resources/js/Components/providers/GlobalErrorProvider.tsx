import React, { ReactNode } from 'react';
import useGlobalErrorHandler, { ErrorToastOptions } from '../../Hooks/useGlobalErrorHandler';

interface GlobalErrorProviderProps {
    children: ReactNode;
    toastOptions?: ErrorToastOptions;
}

/**
 * Automatically handles Laravel validation errors
 * and displays them as toast notifications.
 */
const GlobalErrorProvider: React.FC<GlobalErrorProviderProps> = ({ 
    children, 
    toastOptions 
}) => {
    // Automatically watch for error changes and shows toasts
    useGlobalErrorHandler(toastOptions);

    return <>{children}</>;
};

export default GlobalErrorProvider;
