import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import axios from 'axios';
import useRoute from '@/useHooks/useRoute';
import { IndexedDBService } from '@/Services/IndexDbService';
import { useProposalComparison } from '@/Context/ProposalComparisonContext';

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

async function persistResultsToIndexedDB(results: ComparisonResult[]): Promise<void> {
    await Promise.all(
        results.map((result) =>
            IndexedDBService.update(
                'proposal_comparisons',
                result.proposal_id,
                { ai_analysis: result } as any,
            ),
        ),
    );
}

async function clearResultsFromIndexedDB(proposalIds: string[]): Promise<void> {
    await Promise.all(
        proposalIds.map((id) =>
            IndexedDBService.update(
                'proposal_comparisons',
                id,
                { ai_analysis: null } as any,
            ),
        ),
    );
}

const AiComparisonContext = createContext<AiComparisonContextType | undefined>(undefined);

export const AiComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const route = useRoute();
    const { proposals } = useProposalComparison();

    const persistedResults = useMemo<ComparisonResult[] | null>(() => {
        const extracted = proposals
            .map((p: any) => p.ai_analysis as ComparisonResult | undefined)
            .filter((a): a is ComparisonResult => !!a);
        return extracted.length > 0 ? extracted : null;
    }, [proposals]);

    const [state, setState] = useState<Omit<AiComparisonState, 'results'>>({
        isGenerating: false,
        generatingIds: new Set<string>(),
        error: null,
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
        const existing = persistedResults ?? [];
        const existingIds = new Set(existing.map((r) => r.proposal_id));
        const allCovered = proposalIds.every((id) => existingIds.has(id));

        if (allCovered && existing.length > 0) {
            setState((prev) => ({
                ...prev,
                isGenerating: false,
                error: null,
            }));
            return existing;
        }

        const idSet = new Set(proposalIds);

        setState((prev) => ({
            ...prev,
            isGenerating: true,
            generatingIds: idSet,
            error: null,
        }));

        try {
            const newResults = await fetchProposals(proposalIds);

            // Persist each result onto its proposal in IndexedDB
            await persistResultsToIndexedDB(newResults);

            setState({
                isGenerating: false,
                generatingIds: new Set<string>(),
                error: null,
            });

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
        const existing = persistedResults ?? [];
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

            await persistResultsToIndexedDB(newResults);

            setState((prev) => ({
                ...prev,
                generatingIds: new Set<string>(),
                error: null,
            }));
        } catch (error) {
            console.error('AI Comparison Error (incremental):', error);

            setState((prev) => ({
                ...prev,
                generatingIds: new Set<string>(),
                error: error instanceof Error ? error.message : 'Failed to generate AI comparison',
            }));
        }
    };

    const clearComparison = useCallback(async () => {
        const ids = proposals
            .map((p) => p.id)
            .filter((id): id is string => !!id);

        await clearResultsFromIndexedDB(ids);

        setState({
            isGenerating: false,
            generatingIds: new Set<string>(),
            error: null,
        });
    }, [proposals]);

    return (
        <AiComparisonContext.Provider
            value={{
                ...state,
                results: persistedResults,
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
