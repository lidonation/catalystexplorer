import Title from '@/Components/atoms/Title';
import ExpandableContent from '@/Components/ExpandableContent';
import ExpandableContentAnimation from '@/Components/ExpandableContentAnimation';
import { PageProps } from '@/types';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Markdown from 'marked-react';
import { useEffect, useRef, useState } from 'react';

interface ProposalProblem extends Record<string, unknown> {
    problem?: string;
    slug?: string;
    onContentExpand?: (expanded: boolean, expandedHeight: number) => void;
}

export default function ProposalProblem({
    problem = '',
    slug,
    onContentExpand,
}: PageProps<ProposalProblem>) {
    const { t } = useLaravelReactI18n();
    const [isHoveredProblem, setIsHoveredProblem] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [problemLineCount, setProblemLineCount] = useState(0);

    useEffect(() => {
        const element = containerRef.current;
        if (element) {
            const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
            const height = element.offsetHeight;
            setProblemLineCount(Math.round(height / lineHeight));
        }
    }, [problem]);

    return (
        <ExpandableContentAnimation
            lineClamp={3}
            contentRef={containerRef}
            onHoverChange={setIsHoveredProblem}
        >
            <section
                className="proposal-problem bg-background"
                ref={containerRef}
                data-testid="proposal-problem-section"
            >
                {problem && (
                    <div className="problem-container">
                        <header className="problem-header mb-2 flex justify-between">
                            <Title
                                level="5"
                                id="problem-heading"
                                className="text-content mt-2 text-base font-medium"
                                data-testid="proposal-problem-title"
                            >
                                {t('problem')}
                            </Title>
                        </header>

                        <div className="text-content">
                            <ExpandableContent
                                expanded={isHoveredProblem}
                                lineClamp={3}
                                collapsedHeight={120}
                            >
                                <div
                                    ref={containerRef}
                                    className={`${problemLineCount > 3 ? 'cursor-pointer' : ''} ${isHoveredProblem ? 'bg-background relative' : ''}`}
                                    style={{
                                        paddingBottom: isHoveredProblem
                                            ? '20px'
                                            : '0',
                                    }}
                                    data-testid="proposal-problem-content"
                                >
                                    <Markdown>{problem}</Markdown>
                                </div>
                            </ExpandableContent>
                        </div>
                    </div>
                )}
            </section>
        </ExpandableContentAnimation>
    );
}