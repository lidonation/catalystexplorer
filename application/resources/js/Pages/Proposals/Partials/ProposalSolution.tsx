import Title from '@/Components/atoms/Title';
import { PageProps } from '@/types';
import Markdown from "marked-react";
import { useTranslation } from 'react-i18next';
import ExpandableContentAnimation from '@/Components/ExpandableContentAnimation';
import ExpandableContent from '@/Components/ExpandableContent';
import { useRef, useState, useEffect } from 'react';

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
    const { t } = useTranslation();
    const [isHoveredSolution, setIsHoveredSolution] = useState(false);
    
    const solutionContentRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    
    const [solutionLineCount, setSolutionLineCount] = useState(0);
    const [expandedHeight, setExpandedHeight] = useState(0);

    useEffect(() => {
        const element = solutionContentRef.current;
        if (element) {
            const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
            const height = element.offsetHeight;
            setSolutionLineCount(Math.round(height / lineHeight));
        }
    }, [solution]);
    
    useEffect(() => {
        if (solutionContentRef.current) {
            setTimeout(() => {
                if (solutionContentRef.current) {
                    const height = solutionContentRef.current.scrollHeight;
                    setExpandedHeight(height);
                    
                    if (onContentExpand) {
                        onContentExpand(isHoveredSolution, height + 40);
                    }
                }
            }, 10);
        }
    }, [isHoveredSolution, onContentExpand]);
    
    return (
        <ExpandableContentAnimation
            lineClamp={3}
            contentRef={solutionContentRef}
            onHoverChange={setIsHoveredSolution}
        >
            <section
                className="proposal-solution bg-background"
                ref={containerRef}
            >
                {solution && (
                    <div className="solution-container">
                        <header className="solution-header mb-2 flex justify-between">
                            <Title
                                level="4"
                                id="solution-heading"
                                className="text-content font-medium"
                            >
                                {t('solution')}
                            </Title>
                        </header>

                        <div className="text-content">
                            <ExpandableContent
                                expanded={isHoveredSolution}
                                lineClamp={3}
                                collapsedHeight={120}
                            >
                                <div
                                    ref={solutionContentRef}
                                    className={`${solutionLineCount > 3 ? 'cursor-pointer' : ''}`}
                                    style={{
                                        paddingBottom: isHoveredSolution
                                            ? '20px'
                                            : '0',
                                    }}
                                >
                                    <Markdown>{solution}</Markdown>
                                </div>
                            </ExpandableContent>
                        </div>
                    </div>
                )}
            </section>
        </ExpandableContentAnimation>
    );
}
