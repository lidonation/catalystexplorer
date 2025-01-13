import Plyr from 'plyr';
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import ProposalData = App.DataTransferObjects.ProposalData;
import { ProposalMetrics } from '@/types/proposal-metrics';
import MetricsBar from '@/Pages/Proposals/Partials/MetricsBar';


interface MetricsContextType {
    metrics: ProposalMetrics | undefined;
    setMetrics: React.Dispatch<
        React.SetStateAction<ProposalMetrics | undefined>
    >;
}

const ProposalMetricsContext = createContext<ProposalMetrics>(
    undefined,
);



export const ProposalMetricsProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
   const [metrics, setMetrics] = useState();

    return (
        <ProposalMetricsContext.Provider value={{ metrics, setMetrics }}>
            <MetricsBar {...metrics} />
        </ProposalMetricsContext.Provider>
    );
};

export const usePlayer = (): MetricsContextType => {
    const context = useContext(ProposalMetricsContext);
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
