import { useState, useCallback } from 'react';

interface UseWorkflowSlideOverReturn {
    isOpen: boolean;
    openSlideOver: () => void;
    closeSlideOver: () => void;
    toggleSlideOver: () => void;
}

export function useWorkflowSlideOver(): UseWorkflowSlideOverReturn {
    const [isOpen, setIsOpen] = useState(false);

    const openSlideOver = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeSlideOver = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggleSlideOver = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return {
        isOpen,
        openSlideOver,
        closeSlideOver,
        toggleSlideOver,
    };

    
}
