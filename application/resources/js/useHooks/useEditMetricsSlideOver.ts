import { useCallback, useState } from 'react';

interface UseEditMetricsSlideOverReturn {
    isOpen: boolean;
    openSlideOver: () => void;
    closeSlideOver: () => void;
    toggleSlideOver: () => void;
}

export default function useEditMetricsSlideOver(): UseEditMetricsSlideOverReturn {
    const [isOpen, setIsOpen] = useState(false);

    const openSlideOver = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeSlideOver = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggleSlideOver = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return {
        isOpen,
        openSlideOver,
        closeSlideOver,
        toggleSlideOver,
    };
}