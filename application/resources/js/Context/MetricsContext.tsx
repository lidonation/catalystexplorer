import { ProposalMetrics } from "@/types/proposal-metrics";
import { createContext, useContext, useMemo, useState } from "react";

const MetricsContext = createContext<
    | {
          metrics?: ProposalMetrics;
          setMetrics: React.Dispatch<
              React.SetStateAction<ProposalMetrics | undefined>
          >;
      }
    | undefined
>(undefined);

export const MetricsProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [metrics, setMetrics] = useState<ProposalMetrics | undefined>(
        undefined,
    );

    const value = useMemo(() => ({ metrics, setMetrics }), [metrics]);

    return (
        <MetricsContext.Provider value={value}>
            {children}
        </MetricsContext.Provider>
    );
};

export const useMetrics = () => {
    const context = useContext(MetricsContext);
    if (!context) {
        throw new Error('useMetrics must be used within MetricsProvider');
    }
    return context;
};
