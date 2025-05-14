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
    const [collapsedHeight, setCollapsedHeight] = useState(0);
    
    useEffect(() => {
        const solutionElement = solutionContentRef.current;
        if (solutionElement && solution) {
            const lineHeight = parseFloat(getComputedStyle(solutionElement).lineHeight);
            const height = solutionElement.offsetHeight;
            const calculatedLineCount = Math.round(height / lineHeight);
            
            setSolutionLineCount(calculatedLineCount);
            setCollapsedHeight(lineHeight * 3 + 40);
        }
    }, [solution]);
    
    useEffect(() => {
        if (containerRef.current && isHoveredSolution) {
            const naturalHeight = containerRef.current.scrollHeight;
            const calculatedExpandedHeight = naturalHeight + 30;
            setExpandedHeight(calculatedExpandedHeight);
            
            if (onContentExpand) {
                onContentExpand(true, calculatedExpandedHeight);
            }
        } else if (!isHoveredSolution && collapsedHeight > 0 && onContentExpand) {
            onContentExpand(false, collapsedHeight);
        }
    }, [isHoveredSolution, collapsedHeight, onContentExpand]);
    
    return (
        <div 
            ref={containerRef}
            className="relative w-full transition-all duration-300 ease-in-out"
            style={{
                height: isHoveredSolution && solutionLineCount > 3 
                    ? `${expandedHeight}px` 
                    : `${collapsedHeight > 0 ? collapsedHeight : 'auto'}px`,
                overflow: 'visible'
            }}
        >
            <ExpandableContentAnimation
                lineClamp={3}
                contentRef={solutionContentRef}
                onHoverChange={setIsHoveredSolution}
            >
                <section className="proposal-solution">
                    {solution && (
                        <div className="solution-container">
                            <header className="solution-header flex justify-between mb-2">
                                <Title level="4" id="solution-heading" className="text-content font-medium">
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
                                            paddingBottom: isHoveredSolution ? '20px' : '0',
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
        </div>
    );
}
