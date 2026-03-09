import useRoute from '@/useHooks/useRoute';
import axios from 'axios';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from 'react';

export interface SummaryResult {
    proposal_id: string;
    title: string;
    summary: string;
    one_sentence_summary: string;
    key_points: string[];
    strengths: string[];
    considerations: string[];
}

interface AiSummaryState {
    isGenerating: boolean;
    result: SummaryResult | null;
    error: string | null;
}

interface AiSummaryContextType extends AiSummaryState {
    generateSummary: (proposalId: string) => Promise<SummaryResult>;
    clearSummary: () => void;
}

const AiSummaryContext = createContext<AiSummaryContextType | undefined>(
    undefined,
);

export const AiSummaryProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const route = useRoute();
    const [state, setState] = useState<AiSummaryState>({
        isGenerating: false,
        result: null,
        error: null,
    });

    const fetchSummary = async (proposalId: string): Promise<SummaryResult> => {
        let directApiUrl: string;
        try {
            directApiUrl = route('api.proposals.summarize', {
                proposal: proposalId,
            });
        } catch {
            directApiUrl = `/api/proposals/${proposalId}/summarize`;
        }

        const response = await axios.post(directApiUrl, {
            proposal_id: proposalId,
        });

        const summaryData = response.data;

        if (!summaryData || !summaryData.success || !summaryData.summary) {
            throw new Error(
                summaryData?.error || 'Invalid response format from API',
            );
        }

        const summary = summaryData.summary;

        return {
            proposal_id: proposalId,
            title: summary.title,
            summary: summary.summary,
            one_sentence_summary: summary.one_sentence_summary,
            key_points: summary.key_points || [],
            strengths: summary.strengths || [],
            considerations: summary.considerations || [],
        };
    };

    const generateSummary = async (
        proposalId: string,
    ): Promise<SummaryResult> => {
        setState({
            isGenerating: true,
            result: null,
            error: null,
        });

        try {
            const result = await fetchSummary(proposalId);
            setState({
                isGenerating: false,
                result,
                error: null,
            });
            return result;
        } catch (error) {
            console.error('AI Summary Error:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to generate AI summary';
            setState({
                isGenerating: false,
                result: null,
                error: errorMessage,
            });
            throw error;
        }
    };

    const clearSummary = useCallback(() => {
        setState({
            isGenerating: false,
            result: null,
            error: null,
        });
    }, []);

    return (
        <AiSummaryContext.Provider
            value={{
                ...state,
                generateSummary,
                clearSummary,
            }}
        >
            {children}
        </AiSummaryContext.Provider>
    );
};

export const useAiSummaryContext = (): AiSummaryContextType => {
    const context = useContext(AiSummaryContext);
    if (context === undefined) {
        throw new Error(
            'useAiSummaryContext must be used within an AiSummaryProvider',
        );
    }
    return context;
};
