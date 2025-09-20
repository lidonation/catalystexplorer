import React, { ReactNode } from 'react';
import useGlobalErrorHandler, { ErrorToastOptions } from '@/useHooks/useGlobalErrorHandler';

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
    useGlobalErrorHandler(toastOptions);

    return <>{children}</>;
};

export default GlobalErrorProvider;
