import React, {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { usePlayer } from './PlayerContext';

// Define types for the context values
interface UIContextType {
    isPlayerBarExpanded: boolean;
    isMetricsBarExpanded: boolean;
    setIsPlayerBarExpanded: Dispatch<SetStateAction<boolean>>;
    setIsMetricsBarExpanded: Dispatch<SetStateAction<boolean>>;
}

const noop: Dispatch<SetStateAction<boolean>> = () => {};

// Create context with default values
const UIContext = createContext<UIContextType>({
    isPlayerBarExpanded: false,
    isMetricsBarExpanded: false,
    setIsPlayerBarExpanded: () => noop,
    setIsMetricsBarExpanded: () => noop,
});

// Provider
export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isPlaying } = usePlayer();
    const [isPlayerBarExpanded, setIsPlayerBarExpanded] = useState(isPlaying);
    const [isMetricsBarExpanded, setIsMetricsBarExpanded] = useState(false);

     useEffect(() => {
         if (isMetricsBarExpanded) {
             setIsPlayerBarExpanded(false);
         }
         if (isPlayerBarExpanded) {
             setIsMetricsBarExpanded(false);
         }
     }, [isMetricsBarExpanded, isPlayerBarExpanded]);

     useEffect(() => {
         if (isPlaying) {
             setIsPlayerBarExpanded(true);
         }
     }, [isPlaying]);

    return (
        <UIContext.Provider
            value={{
                isPlayerBarExpanded: false,
                isMetricsBarExpanded,
                setIsPlayerBarExpanded: () => {},
                setIsMetricsBarExpanded,
            }}
        >
            {children}
        </UIContext.Provider>
    );
};

// Hook to use the UI context
export const useUIContext = () => useContext(UIContext);
