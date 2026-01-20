import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface TriggerRect {
    top: number;
    left: number;
    width: number;
    height: number;
}
interface GlobalSearchContextType {
    isOpen: boolean;
    query: string;
    openSearch: () => void;
    closeSearch: () => void;
    toggleSearch: () => void;
    setQuery: (query: string) => void;
    clearQuery: () => void;
    triggerRect: TriggerRect | null;
    registerTrigger: (element: HTMLElement | null) => void;
    updateTriggerRect: () => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextType | null>(null);

interface GlobalSearchProviderProps {
    children: ReactNode;
}

export const GlobalSearchProvider = ({ children }: GlobalSearchProviderProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQueryState] = useState('');
    const [triggerRect, setTriggerRect] = useState<TriggerRect | null>(null);
    const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

    const updateTriggerRect = useCallback(() => {
        if (!triggerElement) {
            setTriggerRect(null);
            return;
        }

        const rect = triggerElement.getBoundingClientRect();
        setTriggerRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        });
    }, [triggerElement]);

    const registerTrigger = useCallback((element: HTMLElement | null) => {
        setTriggerElement(element);
        if (element) {
            const rect = element.getBoundingClientRect();
            setTriggerRect({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
        }
    }, []);

    const openSearch = useCallback(() => {
        if (triggerElement) {
            const rect = triggerElement.getBoundingClientRect();
            setTriggerRect({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
        }
        setIsOpen(true);
    }, [triggerElement]);

    const closeSearch = useCallback(() => {
        setIsOpen(false);
        setQueryState('');
    }, []);

    const toggleSearch = useCallback(() => {
        setIsOpen((prev) => {
            if (prev) {
                setQueryState('');
            } else if (triggerElement) {
                const rect = triggerElement.getBoundingClientRect();
                setTriggerRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                });
            }
            return !prev;
        });
    }, [triggerElement]);

    const setQuery = useCallback((newQuery: string) => {
        setQueryState(newQuery);
    }, []);

    const clearQuery = useCallback(() => {
        setQueryState('');
    }, []);

    return (
        <GlobalSearchContext.Provider
            value={{
                isOpen,
                query,
                openSearch,
                closeSearch,
                toggleSearch,
                setQuery,
                clearQuery,
                triggerRect,
                registerTrigger,
                updateTriggerRect,
            }}
        >
            {children}
        </GlobalSearchContext.Provider>
    );
}

export const useGlobalSearch = (): GlobalSearchContextType => {
    const context = useContext(GlobalSearchContext);
    if (!context) {
        throw new Error('useGlobalSearch must be used within a GlobalSearchProvider');
    }
    return context;
}