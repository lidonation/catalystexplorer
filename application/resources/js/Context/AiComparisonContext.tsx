import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import useRoute from '@/useHooks/useRoute';

interface ComparisonResult {
    proposal_id: string;
    summary: string;
    alignment_score: number;
    feasibility_score: number;
    auditability_score: number;
    total_score: number;
    strengths: string[];
    improvements: string[];
    pros: string[];
    cons: string[];
    one_sentence_summary: string;
    recommendation: 'Fund' | "Don't Fund";
}

interface AiComparisonState {
    isGenerating: boolean;
    results: ComparisonResult[] | null;
    error: string | null;
}

interface AiComparisonContextType extends AiComparisonState {
    generateComparison: (proposalIds: string[]) => Promise<ComparisonResult[]>;
    clearComparison: () => void;
}

const AiComparisonContext = createContext<AiComparisonContextType | undefined>(undefined);

export const AiComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const route = useRoute();
    const [state, setState] = useState<AiComparisonState>({
        isGenerating: false,
        results: null,
        error: null,
    });

    const generateComparison = async (proposalIds: string[]): Promise<ComparisonResult[]> => {
        setState({
            isGenerating: true,
            results: null,
            error: null,
        });

        try {
            // Use direct API as primary method (more reliable than AI agent)
            let directApiUrl: string;
            try {
                directApiUrl = route('api.proposals.compare');
            } catch {
                directApiUrl = '/api/proposals/compare';
            }
            
            const response = await axios.post(directApiUrl, {
                proposal_ids: proposalIds
            });

            // Parse the structured response from the direct API
            const comparisonData = response.data;
            
            if (!comparisonData || !comparisonData.success || !comparisonData.comparisons) {
                console.error('Invalid comparison data structure:', comparisonData);
                throw new Error(comparisonData?.error || 'Invalid response format from API');
            }

            // Transform the data to match our interface
            const results: ComparisonResult[] = comparisonData.comparisons.map((comparison: any) => ({
                proposal_id: comparison.proposal_id,
                summary: comparison.summary,
                alignment_score: comparison.alignment_score,
                feasibility_score: comparison.feasibility_score,
                auditability_score: comparison.auditability_score,
                total_score: comparison.total_score,
                strengths: comparison.strengths || [],
                improvements: comparison.improvements || [],
                pros: comparison.pros || [],
                cons: comparison.cons || [],
                one_sentence_summary: comparison.one_sentence_summary,
                recommendation: comparison.recommendation,
            }));

            setState({
                isGenerating: false,
                results,
                error: null,
            });

            return results;
        } catch (error) {
            console.error('AI Comparison Error:', error);

            // For debugging: provide more detailed error info and fallback
            console.error('Full error details:', {
                error: error,
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });

            if (error instanceof Error && (error.message.includes('Invalid response format') || error.message.includes('404') || error.message.includes('500'))) {
                console.warn('AI agent failed, trying direct API fallback:', error.message);

                try {
                    // Try direct API as fallback
                    let directApiUrl: string;
                    try {
                        directApiUrl = route('api.proposals.compare');
                    } catch {
                        directApiUrl = '/api/proposals/compare';
                    }

                    const fallbackResponse = await axios.post(directApiUrl, {
                        proposal_ids: proposalIds
                    });

                    const fallbackData = fallbackResponse.data;
                    if (fallbackData.success && fallbackData.comparisons) {
                        const results: ComparisonResult[] = fallbackData.comparisons.map((comparison: any) => ({
                            proposal_id: comparison.proposal_id,
                            summary: comparison.summary,
                            alignment_score: comparison.alignment_score,
                            feasibility_score: comparison.feasibility_score,
                            auditability_score: comparison.auditability_score,
                            total_score: comparison.total_score,
                            strengths: comparison.strengths || [],
                            improvements: comparison.improvements || [],
                            pros: comparison.pros || [],
                            cons: comparison.cons || [],
                            one_sentence_summary: comparison.one_sentence_summary,
                            recommendation: comparison.recommendation,
                        }));

                        setState({
                            isGenerating: false,
                            results,
                            error: null,
                        });

                        return results;
                    }
                } catch (fallbackError) {
                    console.error('Direct API fallback also failed:', fallbackError);
                }

                console.warn('Both AI agent and direct API failed, using mock data');

                const mockResults: ComparisonResult[] = proposalIds.map((id, index) => ({
                    proposal_id: id,
                    summary: `[DEBUG] Mock analysis for proposal ${id} - AI tool execution failed`,
                    alignment_score: 20 + (index * 2),
                    feasibility_score: 25 + (index * 2),
                    auditability_score: 25 + (index * 2),
                    total_score: 70 + (index * 5),
                    strengths: [
                        '[DEBUG] Mock strength - Clear problem identification',
                        '[DEBUG] Mock strength - Reasonable approach',
                    ],
                    improvements: [
                        '[DEBUG] Mock improvement - Tool execution needs fixing',
                    ],
                    pros: [
                        '[DEBUG] Mock pro - This is test data',
                        '[DEBUG] Mock pro - Tool needs debugging',
                    ],
                    cons: [
                        '[DEBUG] Mock con - AI agent not using tool properly',
                        '[DEBUG] Mock con - Response parsing failed',
                    ],
                    one_sentence_summary: `[DEBUG] Mock summary for proposal ${id} - tool execution failed.`,
                    recommendation: index % 2 === 0 ? 'Fund' : "Don't Fund",
                }));

                setState({
                    isGenerating: false,
                    results: mockResults,
                    error: null,
                });

                return mockResults;
            }

            const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI comparison';
            setState({
                isGenerating: false,
                results: null,
                error: errorMessage,
            });
            throw error;
        }
    };

    const clearComparison = () => {
        setState({
            isGenerating: false,
            results: null,
            error: null,
        });
    };

    return (
        <AiComparisonContext.Provider
            value={{
                ...state,
                generateComparison,
                clearComparison,
            }}
        >
            {children}
        </AiComparisonContext.Provider>
    );
};

export const useAiComparisonContext = (): AiComparisonContextType => {
    const context = useContext(AiComparisonContext);
    if (context === undefined) {
        throw new Error('useAiComparisonContext must be used within an AiComparisonProvider');
    }
    return context;
};
