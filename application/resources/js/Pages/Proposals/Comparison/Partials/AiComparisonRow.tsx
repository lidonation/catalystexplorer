import React, { useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Sparkles, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAiComparisonContext } from '@/Context/AiComparisonContext';
import { useProposalComparison } from '@/Context/ProposalComparisonContext';

interface AiComparisonRowProps {
    height: string;
}

export default function AiComparisonRow({ height }: AiComparisonRowProps) {
    const { t } = useLaravelReactI18n();
    const { filteredProposals } = useProposalComparison();
    const { isGenerating, results, error, generateComparison, clearComparison } = useAiComparisonContext();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleGenerateComparison = async () => {
        const proposalIds = filteredProposals
            .map(proposal => proposal.id)
            .filter((id): id is string => id !== null && id !== undefined);
        
        if (proposalIds.length === 0) return;

        try {
            await generateComparison(proposalIds);
            setIsExpanded(true);
        } catch (err) {
            console.error('Failed to generate AI comparison:', err);
        }
    };

    const toggleExpanded = () => setIsExpanded(!isExpanded);

    return (
        <>
            {/* Main AI Comparison Row */}
            <div className="flex w-full">
                {/* Sticky Row Header - matches other rows */}
                <div className="bg-background sticky left-0 z-10 flex flex-col">
                    <div
                        className={`${height} border-gray-light flex items-center border-r border-b px-4 text-left font-medium`}
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            <span>{t('proposalComparison.tableHeaders.aiComparison')}</span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area - matches table structure */}
                <div className="border-gray-light flex-1 border-l" style={{ maxWidth: 'calc(100% - 120px)' }}>
                    <div className={`${height} border-gray-light flex items-center justify-between border-b p-4 bg-gradient-to-r from-blue-50 to-purple-50`}>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                                {t('proposalComparison.aiComparison.basedOn')}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {results && (
                                <button
                                    onClick={toggleExpanded}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    {isExpanded ? 'Hide Results' : 'Show Results'}
                                </button>
                            )}
                            
                            {!results && !isGenerating && (
                                <button
                                    onClick={handleGenerateComparison}
                                    disabled={filteredProposals.length < 2 || isGenerating}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    {t('proposalComparison.generateAiComparison')}
                                </button>
                            )}

                            {isGenerating && (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                    <span className="text-sm">
                                        {t('proposalComparison.aiComparison.generating')}
                                    </span>
                                </div>
                            )}

                            {results && (
                                <button
                                    onClick={clearComparison}
                                    className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display - Full Width */}
            {error && (
                <div className="w-full bg-red-50 border border-red-200 border-t-0">
                    <div className="flex items-center p-4">
                        <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                        <span className="text-sm text-red-700">{error}</span>
                    </div>
                </div>
            )}

            {/* Results Display - Full Width */}
            {results && isExpanded && (
                <div className="w-full bg-white border border-gray-200 border-t-0 rounded-b-lg">
                    <div className="p-4">
                        <div className="mb-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                {t('proposalComparison.aiComparison.title')}
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Comparative analysis of {results.length} proposals using the official Catalyst Fund 14 scoring rubric
                            </p>
                        </div>

                        {/* Comparison Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {results.map((result, index) => {
                                const proposal = filteredProposals.find(p => p.id === result.proposal_id);
                                return (
                                    <div key={result.proposal_id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="mb-3">
                                            <h5 className="font-medium text-gray-800 text-sm mb-1">
                                                {proposal?.title || `Proposal ${index + 1}`}
                                            </h5>
                                            <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                                                result.recommendation === 'Fund' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {result.recommendation}
                                            </div>
                                        </div>

                                        {/* Scores */}
                                        <div className="mb-3">
                                            <div className="text-lg font-bold text-gray-800 mb-2">
                                                {result.total_score}/100
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span>Alignment:</span>
                                                    <span className="font-medium">{result.alignment_score}/30</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span>Feasibility:</span>
                                                    <span className="font-medium">{result.feasibility_score}/35</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span>Auditability:</span>
                                                    <span className="font-medium">{result.auditability_score}/35</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        <div className="mb-3">
                                            <h6 className="text-xs font-medium text-gray-700 mb-1">Key Strengths:</h6>
                                            <ul className="text-xs text-gray-600 space-y-1">
                                                {result.strengths.slice(0, 2).map((strength, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <span className="text-green-500 mr-1">•</span>
                                                        {strength}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h6 className="text-xs font-medium text-gray-700 mb-1">Areas for Improvement:</h6>
                                            <ul className="text-xs text-gray-600 space-y-1">
                                                {result.improvements.slice(0, 2).map((improvement, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <span className="text-orange-500 mr-1">•</span>
                                                        {improvement}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
