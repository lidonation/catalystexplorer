import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types for the context values
interface UIContextType {
  isPlayerBarExpanded: boolean;
  isMetricsBarExpanded: boolean;
  togglePlayerBar: () => void;
  toggleMetricsBar: () => void;
}

// Create context with default values
const UIContext = createContext<UIContextType>({
  isPlayerBarExpanded: false,
  isMetricsBarExpanded: false,
  togglePlayerBar: () => {},
  toggleMetricsBar: () => {},
});

// Provider
export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlayerBarExpanded, setIsPlayerBarExpanded] = useState(false);
  const [isMetricsBarExpanded, setIsMetricsBarExpanded] = useState(false);

  const togglePlayerBar = () => {
    setIsPlayerBarExpanded((prev) => !prev);
    if (isMetricsBarExpanded) {
      setIsMetricsBarExpanded(false); // Collapse the Metrics Bar when Player Bar is expanded
    }
  };

  const toggleMetricsBar = () => {
    setIsMetricsBarExpanded((prev) => !prev);
    if (isPlayerBarExpanded) {
      setIsPlayerBarExpanded(false); // Collapse the Player Bar when Metrics Bar is expanded
    }
  };

  return (
    <UIContext.Provider
      value={{
        isPlayerBarExpanded,
        isMetricsBarExpanded,
        togglePlayerBar,
        toggleMetricsBar,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

// Hook to use the UI context
export const useUIContext = () => useContext(UIContext);
