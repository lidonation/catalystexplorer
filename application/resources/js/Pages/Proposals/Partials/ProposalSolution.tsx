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
}

export default function ProposalSolution({
    solution = '',
    problem = '',
    slug,
}: PageProps<ProposalSolution>) {
    const { t } = useTranslation();
    const [isHoveredSolution, setIsHoveredSolution] = useState(false);
    
    const solutionContentRef = useRef<HTMLDivElement | null>(null);
    
    const [solutionLineCount, setSolutionLineCount] = useState(0);
    
    useEffect(() => {
        const solutionElement = solutionContentRef.current;
        if (solutionElement && solution) {
            const lineHeight = parseFloat(getComputedStyle(solutionElement).lineHeight);
            const height = solutionElement.offsetHeight;
            setSolutionLineCount(Math.round(height / lineHeight));
        }
    }, [solution]);

    return (
        <section 
            className="proposal-solution space-y-6 transition-all duration-300 ease-in-out" 
            aria-labelledby="solution-preview"
            style={{ overflow: 'visible' }}
        >
            {solution && (
                <div 
                    className="solution-container transition-all duration-300 ease-in-out"
                    style={{ 
                        overflow: 'visible',
                        height: 'auto'
                    }}
                >
                    <header className="solution-header flex justify-between">
                        <Title level="4" id="solution-heading" className="text-content font-medium">
                            {t('solution')}
                        </Title>
                    </header>

                    <div className="text-content pb-2 overflow-visible">
                        <ExpandableContentAnimation 
                            lineClamp={3}
                            contentRef={solutionContentRef}
                            onHoverChange={setIsHoveredSolution}
                            className="overflow-visible"
                        >
                            <div style={{ overflow: 'visible' }}>
                                <div ref={solutionContentRef}>
                                    <ExpandableContent
                                        expanded={isHoveredSolution}
                                        lineClamp={3}
                                        transitionDuration="0.3s"
                                    >
                                        <Markdown>{solution}</Markdown>
                                    </ExpandableContent>
                                </div>
                            </div>
                        </ExpandableContentAnimation>
                    </div>
                </div>
            )}
        </section>
    );
}
