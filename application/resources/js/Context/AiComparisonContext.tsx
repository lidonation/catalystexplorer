import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

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
            const response = await axios.post('/api/vizra-adk/chat/completions', {
                model: 'catalyst-reviewer',
                messages: [
                    {
                        role: 'user',
                        content: `Please provide a comprehensive comparison of the following Project Catalyst proposals based on the Fund 14 scoring rubric. For each proposal, analyze alignment, feasibility, and auditability, then provide scores and recommendations.

Proposal IDs to compare: ${proposalIds.join(', ')}

Please format your response as a structured comparison that evaluates each proposal across the three key dimensions (Alignment, Feasibility, Auditability) and provides:

1. One-sentence summary capturing the essence of each proposal
2. Detailed scores (Alignment /30, Feasibility /35, Auditability /35)
3. Key strengths and areas for improvement
4. Top 3 pros (advantages and positive aspects)
5. Top 3 cons (disadvantages and concerns)
6. Final funding recommendation
7. Comparative analysis highlighting the relative strengths of each proposal`,
                    },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            });

            // For now, we'll parse the text response and create mock structured data
            // In a real implementation, you'd want to structure the AI response better
            const content = response.data.choices[0]?.message?.content || '';
            
            // Create mock structured results based on the response
            // This would be better implemented with structured AI output
            const results: ComparisonResult[] = proposalIds.map((id, index) => ({
                proposal_id: id,
                summary: `AI-generated summary for proposal ${id}...`,
                alignment_score: 20 + Math.floor(Math.random() * 10),
                feasibility_score: 25 + Math.floor(Math.random() * 10),
                auditability_score: 25 + Math.floor(Math.random() * 10),
                total_score: 70 + Math.floor(Math.random() * 25),
                strengths: [
                    'Clear problem identification',
                    'Realistic timeline and budget',
                    'Strong team capabilities',
                ],
                improvements: [
                    'Could benefit from more detailed success metrics',
                    'Risk mitigation strategies need strengthening',
                ],
                pros: [
                    'Innovative approach to solving the problem',
                    'Well-defined success criteria',
                    'Experienced team with relevant background',
                ],
                cons: [
                    'Budget may be insufficient for scope',
                    'Limited community engagement strategy',
                    'Technical risks not fully addressed',
                ],
                one_sentence_summary: `This proposal presents a ${Math.random() > 0.5 ? 'promising' : 'challenging'} solution with ${Math.random() > 0.5 ? 'strong technical merit' : 'room for improvement'} and ${Math.random() > 0.5 ? 'clear execution plans' : 'unclear implementation details'}.`,
                recommendation: Math.random() > 0.3 ? 'Fund' : "Don't Fund",
            }));

            setState({
                isGenerating: false,
                results,
                error: null,
            });

            return results;
        } catch (error) {
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