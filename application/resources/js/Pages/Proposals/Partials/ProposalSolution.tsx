import Title from '@/Components/atoms/Title';
import ExpandableContent from '@/Components/ExpandableContent';
import ExpandableContentAnimation from '@/Components/ExpandableContentAnimation';
import { PageProps } from '@/types';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Markdown from 'marked-react';
import { useEffect, useRef, useState } from 'react';
import ValueLabel from '@/Components/atoms/ValueLabel.tsx';

interface ProposalSolution extends Record<string, unknown> {
    solution?: string;
    problem?: string;
    slug?: string;
    onContentExpand?: (expanded: boolean, expandedHeight: number) => void;
}

export default function ProposalSolution({
    solution = '',
    problem = '',
    slug,
    onContentExpand,
}: PageProps<ProposalSolution>) {
    const { t } = useLaravelReactI18n();
    const [isHoveredSolution, setIsHoveredSolution] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [solutionLineCount, setSolutionLineCount] = useState(0);

    useEffect(() => {
        const element = containerRef.current;
        if (element) {
            const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
            const height = element.offsetHeight;
            setSolutionLineCount(Math.round(height / lineHeight));
        }
    }, [solution]);

    return (
        <ExpandableContentAnimation
            lineClamp={3}
            contentRef={containerRef}
            onHoverChange={setIsHoveredSolution}
        >
            <section
                className="proposal-solution bg-background"
                ref={containerRef}
                data-testid="proposal-solution-section"
            >
                {(solution || problem) && (
                    <div className="solution-container">
                        <header className="solution-header mb-2 flex justify-between">
                            <ValueLabel
                                // level="5"
                                id="solution-heading"
                                className="text-content mt-2 text-base font-medium"
                                data-testid="proposal-solution-or-problem"
                            >
                                {solution ? t('solution') : t('problem')}
                            </ValueLabel>
                        </header>

                        <div className="text-content">
                            <ExpandableContent
                                expanded={isHoveredSolution}
                                lineClamp={4}
                                collapsedHeight={180}
                            >
                                <div
                                    ref={containerRef}
                                    className={`text-sm ${solutionLineCount > 3 ? 'cursor-pointer' : ''} ${isHoveredSolution ? 'bg-background relative' : ''}`}
                                    style={{
                                        paddingBottom: isHoveredSolution
                                            ? '20px'
                                            : '0',
                                    }}
                                    data-testid="proposal-solution-or-problem-content"
                                >
                                    <Markdown>{solution || problem}</Markdown>
                                </div>
                            </ExpandableContent>
                        </div>
                    </div>
                )}
            </section>
        </ExpandableContentAnimation>
    );
}
