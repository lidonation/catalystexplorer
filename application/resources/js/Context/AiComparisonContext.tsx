import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';
import useRoute from '@/useHooks/useRoute';
import storageService from '@/utils/storage-service';
import { StorageKeys } from '@/enums/storage-keys-enums';

export interface ComparisonResult {
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

interface CachedComparison {
    key: string;
    results: ComparisonResult[];
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

function getCacheKey(proposalIds: string[]): string {
    return [...proposalIds].sort().join(',');
}

function loadCachedResults(): CachedComparison | null {
    const cached = storageService.get<CachedComparison>(
        StorageKeys.AI_COMPARISON_RESULTS,
        undefined,
        'session',
    );
    if (cached?.key && Array.isArray(cached?.results) && cached.results.length > 0) {
        return cached;
    }
    return null;
}

function saveCachedResults(key: string, results: ComparisonResult[]): void {
    storageService.save<CachedComparison>(
        StorageKeys.AI_COMPARISON_RESULTS,
        { key, results },
        'session',
    );
}

function clearCachedResults(): void {
    storageService.remove(StorageKeys.AI_COMPARISON_RESULTS, 'session');
}

const AiComparisonContext = createContext<AiComparisonContextType | undefined>(undefined);

export const AiComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const route = useRoute();
    const [state, setState] = useState<AiComparisonState>(() => {
        const cached = loadCachedResults();
        if (cached) {
            return {
                isGenerating: false,
                results: cached.results,
                error: null,
            };
        }
        return {
            isGenerating: false,
            results: null,
            error: null,
        };
    });

    const generateComparison = async (proposalIds: string[]): Promise<ComparisonResult[]> => {
        // Check if we already have cached results for these exact proposals
        const cacheKey = getCacheKey(proposalIds);
        const cached = loadCachedResults();
        if (cached && cached.key === cacheKey) {
            setState({
                isGenerating: false,
                results: cached.results,
                error: null,
            });
            return cached.results;
        }

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

            // Persist to sessionStorage
            saveCachedResults(cacheKey, results);

            return results;
        } catch (error) {
            console.error('AI Comparison Error:', error);

            const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI comparison';
            setState({
                isGenerating: false,
                results: null,
                error: errorMessage,
            });
            throw error;
        }
    };

    const clearComparison = useCallback(() => {
        clearCachedResults();
        setState({
            isGenerating: false,
            results: null,
            error: null,
        });
    }, []);

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
