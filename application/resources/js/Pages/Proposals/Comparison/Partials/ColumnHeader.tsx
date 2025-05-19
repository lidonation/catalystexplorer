import Title from '@/Components/atoms/Title';
import ExpandableContent from '@/Components/ExpandableContent';
import ExpandableContentAnimation from '@/Components/ExpandableContentAnimation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ColumnHeader({
    proposal,
}: {
    proposal: App.DataTransferObjects.ProposalData;

}) {
    const [isHovered, setIsHovered] = useState(false);

    const gradientColors: Record<string, unknown> = {
        complete:
            'from-[var(--success-gradient-color-1)] to-[var(--success-gradient-color-2)]',
        default:
            'from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]',
    };

    const headerBGColor =
        proposal?.status == 'complete'
            ? gradientColors.complete
            : gradientColors.default;

    const contentRef = useRef<HTMLParagraphElement | null>(null);
    const [lineCount, setLineCount] = useState(0);

    const { t } = useTranslation();

    useEffect(() => {
        const element = contentRef.current;
        if (element) {
            const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
            const height = element.offsetHeight;
            setLineCount(Math.round(height / lineHeight));
        }
    }, [proposal?.title]);

    return (
        <ExpandableContentAnimation
            lineClamp={3}
            contentRef={contentRef}
            onHoverChange={setIsHovered}
        >
            <header
                className={`text-content-light w-full rounded-xl bg-linear-to-tr ${headerBGColor} flex shrink flex-col `}
            >
                {/* Card Content */}
                <div
                    className={ 'flex h-full min-h-20 w-full items-center justify-center p-2 px-4 leading-tight'}
                    style={{ overflow: 'visible' }}
                >
                    <a
                        href={proposal.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={'hover:text-primary font-medium'}
                        style={{ overflow: 'visible' }}
                    >
                        <div ref={contentRef}>
                            <ExpandableContent
                                className="text-ellipsis"
                                lineClamp={3}
                                expanded={isHovered}
                            >
                                <Title level="4">{proposal.title}</Title>
                            </ExpandableContent>
                        </div>
                    </a>
                </div>
            </header>
        </ExpandableContentAnimation>
    );
}
