import { ReputationTier } from '@/enums/reputation-tier-enums';
import React, { useEffect, useRef, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import Paragraph from './atoms/Paragraph';
import ToolTipHover from './ToolTipHover';
import ReviewData = App.DataTransferObjects.ReviewData;
import { createPortal } from 'react-dom';

export interface ReputationBadgeProps {
    review: ReviewData;
    className?: string;
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
    review,
    className = '',
}) => {
    const { t } = useLaravelReactI18n();
    const [showTooltip, setShowTooltip] = useState(false);
    const badgeRef = useRef<HTMLDivElement>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (showTooltip && badgeRef.current) {
            const rect = badgeRef.current.getBoundingClientRect();
            setTooltipPosition({
                top: rect.top - 40,
                left: rect.left + rect.width / 2
            });
        }
    }, [showTooltip]);

    if (
        !review?.reviewer?.reputation_scores ||
        review?.reviewer?.reputation_scores.length === 0
    ) {
        return null;
    }

    const finalScore = review?.reviewer?.avg_reputation_score;

    const getTier = (score: number | null) => {
        if (!score) return;

        if (score >= ReputationTier.GOOD_MARK) return ReputationTier.GOOD;
        if (score >= ReputationTier.NEUTRAL_MARK) return ReputationTier.NEUTRAL;
        if (score >= ReputationTier.NOT_GREAT_MARK)
            return ReputationTier.NOT_GREAT;
        return ReputationTier.NOT_GREAT;
    };

    const tier = getTier(finalScore);

    const hexagonPath =
        'M28,4 C29.6,4 31.2,4.4 32.5,5.1 L48.6,15.1 C50.5,15.8 51.5,16.9 51.5,18 L51.5,38 C51.5,39.1 50.5,40.2 48.6,40.9 L32.5,50.9 C31.2,51.6 29.6,52 28,52 C26.4,52 24.8,51.6 23.5,50.9 L7.4,40.9 C5.5,40.2 4.5,39.1 4.5,38 L4.5,18 C4.5,16.9 5.5,15.8 7.4,15.1 L23.5,5.1 C24.8,4.4 26.4,4 28,4 Z';

    // Define Tailwind color classes based on tier
    const getColorClasses = () => {
        switch (tier) {
            case ReputationTier.GOOD:
                return {
                    fillClass: 'fill-success-light',
                    strokeClass: 'stroke-success-border',
                    textClass: 'text-success',
                };
            case ReputationTier.NEUTRAL:
                return {
                    fillClass: 'fill-primary-light',
                    strokeClass: 'stroke-primary-border',
                    textClass: 'text-primary',
                };
            case ReputationTier.NOT_GREAT:
                return {
                    fillClass: 'fill-error-light',
                    strokeClass: 'stroke-error-border',
                    textClass: 'text-error',
                };
            default:
                return {
                    fillClass: 'fill-dark',
                    strokeClass: 'stroke-darker',
                    textClass: 'text-darker',
                };
        }
    };

    const colorClasses = getColorClasses();

    return (
        <div
            ref={badgeRef}
            className={`relative inline-block ${className}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <svg height="50" viewBox="0 0 56 56">
                <path
                    d={hexagonPath}
                    className={`${colorClasses.fillClass} ${colorClasses.strokeClass}`}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <foreignObject x="10" y="18" width="36" height="20">
                    <div className="flex h-full items-center justify-center">
                        <Paragraph
                            size="lg"
                            className={`${colorClasses.textClass} text-center font-bold`}
                        >
                            {finalScore}%
                        </Paragraph>
                    </div>
                </foreignObject>
            </svg>

            {showTooltip && document.body && createPortal(
                <div
                    className="fixed transform -translate-x-1/2 z-[1000]"
                    style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`
                    }}
                >
                    <ToolTipHover
                        props={t('reviewerReputationScore')}
                        className="w-auto px-3"
                    />
                </div>,
                document.body
            )}
        </div>
    );
};

export default ReputationBadge;
