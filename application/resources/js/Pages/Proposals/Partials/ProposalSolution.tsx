import Title from '@/Components/atoms/Title';
import { PageProps } from '@/types';
import Markdown from "marked-react";
import { useState, useMemo } from 'react';
import Button from '@/Components/atoms/Button';
import { useTranslation } from 'react-i18next';
import Paragraph from '@/Components/atoms/Paragraph';

interface ProposalSolution extends Record<string, unknown> {
    solution?: string;
    problem?: string;
    slug?: string;
}

function truncateText(text: string | null, limit: number): string {
    if (!text) {
        return '';
    }
    if (text.length > limit) {
        let truncated = text.slice(0, limit);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        if (lastSpaceIndex > 0) {
            truncated = truncated.slice(0, lastSpaceIndex);
        }
        return truncated + '...';
    }
    return text;
}

export default function ProposalSolution({
    solution = '',
    problem = '',
    slug,
}: PageProps<ProposalSolution>) {
    const { t } = useTranslation();

    const [showFullSolution, setShowFullSolution] = useState(false);
    const [showFullProblem, setShowFullProblem] = useState(false);
    
    const CHARACTER_LIMIT = 100;
    
    const truncatedSolution = useMemo(() => 
        truncateText(solution, CHARACTER_LIMIT), [solution]);
    
    const truncatedProblem = useMemo(() => 
        truncateText(problem, CHARACTER_LIMIT), [problem]);
    
    const toggleSolution = () => setShowFullSolution(prev => !prev);
    const toggleProblem = () => setShowFullProblem(prev => !prev);
    
    const isSolutionTruncated = solution.length > CHARACTER_LIMIT;
    const isProblemTruncated = problem.length > CHARACTER_LIMIT;

    return (
        <section className="proposal-solution space-y-6" aria-labelledby="solution-preview">
            {solution && (
                <div>
                    <header className="solution-header flex justify-between">
                        <Title level="4" id="solution-heading" className="text-content font-medium">
                            {t('solution')}
                        </Title>
                    </header>

                    <div className="text-content pb-2">
                        {showFullSolution ? (
                            <>
                                <Markdown>{solution}</Markdown>
                                <Button
                                    onClick={toggleSolution}
                                    className="text-primary font-bold hover:underline mt-2 block"
                                >
                                    {t('seeLess')}
                                </Button>
                            </>
                        ) : (
                            <div className="solution-content">
                                <Paragraph>
                                    {truncatedSolution}
                                    {isSolutionTruncated && (
                                        <Button
                                            onClick={toggleSolution}
                                            className="text-primary font-bold hover:underline ml-1 inline-flex items-center"
                                        >
                                            {t('seeMore')}
                                        </Button>
                                    )}
                                </Paragraph>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {problem && (
                <div>
                    <Title level="4" className="text-content font-medium border-t border-gray-persist pt-2">
                        {t('problem')}
                    </Title>
                    
                    <div className="text-content pb-2">
                        {showFullProblem ? (
                            <>
                                <Markdown>{problem}</Markdown>
                                <Button
                                    onClick={toggleProblem}
                                    className="text-primary font-bold hover:underline mt-2 block"
                                >
                                    {t('seeLess')}
                                </Button>
                            </>
                        ) : (
                            <div>
                                <Paragraph>
                                    {truncatedProblem}
                                    {isProblemTruncated && (
                                        <Button
                                            onClick={toggleProblem}
                                            className="text-primary font-bold hover:underline ml-1 inline-flex items-center"
                                        >
                                            {t('seeMore')}
                                        </Button>
                                    )}
                                </Paragraph>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
