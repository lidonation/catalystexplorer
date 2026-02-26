import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
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

interface AiComparisonState {
    isGenerating: boolean;
    generatingIds: Set<string>;
    results: ComparisonResult[] | null;
    error: string | null;
}

interface AiComparisonContextType extends AiComparisonState {
    generateComparison: (proposalIds: string[]) => Promise<ComparisonResult[]>;
    generateForNewProposals: (allIds: string[]) => Promise<void>;
    clearComparison: () => void;
}

function loadCachedResults(): ComparisonResult[] | null {
    const cached = storageService.get<ComparisonResult[]>(
        StorageKeys.AI_COMPARISON_RESULTS,
        undefined,
        'session',
    );
    if (Array.isArray(cached) && cached.length > 0) {
        return cached;
    }
    return null;
}

function saveCachedResults(results: ComparisonResult[]): void {
    storageService.save<ComparisonResult[]>(
        StorageKeys.AI_COMPARISON_RESULTS,
        results,
        'session',
    );
}

function clearCachedResults(): void {
    storageService.remove(StorageKeys.AI_COMPARISON_RESULTS, 'session');
}

function parseResults(comparisons: any[]): ComparisonResult[] {
    return comparisons.map((comparison: any) => ({
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
}

const AiComparisonContext = createContext<AiComparisonContextType | undefined>(undefined);

export const AiComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const route = useRoute();
    const resultsRef = useRef<ComparisonResult[] | null>(null);

    const [state, setState] = useState<AiComparisonState>(() => {
        const cached = loadCachedResults();
        if (cached) {
            resultsRef.current = cached;
            return {
                isGenerating: false,
                generatingIds: new Set<string>(),
                results: cached,
                error: null,
            };
        }
        return {
            isGenerating: false,
            generatingIds: new Set<string>(),
            results: null,
            error: null,
        };
    });

    const fetchProposals = async (proposalIds: string[]): Promise<ComparisonResult[]> => {
        let directApiUrl: string;
        try {
            directApiUrl = route('api.proposals.compare');
        } catch {
            directApiUrl = '/api/proposals/compare';
        }

        const response = await axios.post(directApiUrl, {
            proposal_ids: proposalIds,
        });

        const comparisonData = response.data;

        if (!comparisonData || !comparisonData.success || !comparisonData.comparisons) {
            console.error('Invalid comparison data structure:', comparisonData);
            throw new Error(comparisonData?.error || 'Invalid response format from API');
        }

        return parseResults(comparisonData.comparisons);
    };

    const generateComparison = async (proposalIds: string[]): Promise<ComparisonResult[]> => {
        // Check which proposals already have results
        const existing = resultsRef.current ?? [];
        const existingIds = new Set(existing.map((r) => r.proposal_id));
        const allCovered = proposalIds.every((id) => existingIds.has(id));

        if (allCovered && existing.length > 0) {
            setState((prev) => ({
                ...prev,
                isGenerating: false,
                results: existing,
                error: null,
            }));
            return existing;
        }

        const idSet = new Set(proposalIds);

        setState((prev) => ({
            ...prev,
            isGenerating: true,
            generatingIds: idSet,
            results: prev.results,
            error: null,
        }));

        try {
            const newResults = await fetchProposals(proposalIds);

            // Merge with existing results (new results take precedence)
            const merged = [...existing.filter((r) => !idSet.has(r.proposal_id)), ...newResults];

            resultsRef.current = merged;

            setState({
                isGenerating: false,
                generatingIds: new Set<string>(),
                results: merged,
                error: null,
            });

            saveCachedResults(merged);

            return newResults;
        } catch (error) {
            console.error('AI Comparison Error:', error);

            const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI comparison';
            setState((prev) => ({
                ...prev,
                isGenerating: false,
                generatingIds: new Set<string>(),
                error: errorMessage,
            }));
            throw error;
        }
    };

    const generateForNewProposals = async (allIds: string[]): Promise<void> => {
        const existing = resultsRef.current ?? [];
        const existingIds = new Set(existing.map((r) => r.proposal_id));
        const newIds = allIds.filter((id) => !existingIds.has(id));

        if (newIds.length === 0) return;

        const newIdSet = new Set(newIds);

        setState((prev) => ({
            ...prev,
            generatingIds: newIdSet,
        }));

        try {
            const newResults = await fetchProposals(newIds);

            const merged = [...existing, ...newResults];
            resultsRef.current = merged;

            setState((prev) => ({
                ...prev,
                generatingIds: new Set<string>(),
                results: merged,
                error: null,
            }));

            saveCachedResults(merged);
        } catch (error) {
            console.error('AI Comparison Error (incremental):', error);

            setState((prev) => ({
                ...prev,
                generatingIds: new Set<string>(),
                error: error instanceof Error ? error.message : 'Failed to generate AI comparison',
            }));
        }
    };

    const clearComparison = useCallback(() => {
        clearCachedResults();
        resultsRef.current = null;
        setState({
            isGenerating: false,
            generatingIds: new Set<string>(),
            results: null,
            error: null,
        });
    }, []);

    return (
        <AiComparisonContext.Provider
            value={{
                ...state,
                generateComparison,
                generateForNewProposals,
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
