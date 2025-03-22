import React from 'react';
import ReviewReputationScoreData = App.DataTransferObjects.ReviewerReputationScoreData;
import Paragraph from './atoms/Paragraph';
import { ReviewItem } from '@/Pages/IdeascaleProfile/Reviews/Index';

export interface ReputationBadgeProps {
    review: ReviewItem;
    className?: string;
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
    review,
    className = '',
}) => {
    if (!review.reputationScores || review.reputationScores.length === 0) {
        return null;
    }
    
    const finalScore = review.reputationScores[0].score;
    
    const getTier = (score: number) => {
        if (score >= 70) return 'good';
        if (score >= 40) return 'neutral';
        return 'not-great';
    };
    
    const tier = getTier(finalScore);

    const hexagonPath = "M28,4 C29.6,4 31.2,4.4 32.5,5.1 L48.6,15.1 C50.5,15.8 51.5,16.9 51.5,18 L51.5,38 C51.5,39.1 50.5,40.2 48.6,40.9 L32.5,50.9 C31.2,51.6 29.6,52 28,52 C26.4,52 24.8,51.6 23.5,50.9 L7.4,40.9 C5.5,40.2 4.5,39.1 4.5,38 L4.5,18 C4.5,16.9 5.5,15.8 7.4,15.1 L23.5,5.1 C24.8,4.4 26.4,4 28,4 Z";
    
    // Define Tailwind color classes based on tier
    const getColorClasses = () => {
        switch (tier) {
            case 'good':
                return {
                    fillClass: 'fill-success-light',
                    strokeClass: 'stroke-success',
                    textClass: 'text-success'
                };
            case 'neutral':
                return {
                    fillClass: 'fill-primary-light',
                    strokeClass: 'stroke-primary',
                    textClass: 'text-primary'
                };
            case 'not-great':
                return {
                    fillClass: 'fill-error-light',
                    strokeClass: 'stroke-error',
                    textClass: 'text-error'
                };
            default:
                return {
                    fillClass: 'fill-dark',
                    strokeClass: 'stroke-darker',
                    textClass: 'text-darker'
                };
        }
    };
    
    const colorClasses = getColorClasses();
    
    return (
        <div className={`inline-block ${className}`}>
            <svg width="75" height="50" viewBox="0 0 56 56">
                <path 
                    d={hexagonPath}
                    className={`${colorClasses.fillClass} ${colorClasses.strokeClass}`}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <foreignObject x="10" y="18" width="36" height="20">
                    <div className="flex justify-center items-center h-full">
                        <Paragraph 
                            size="sm" 
                            className={`${colorClasses.textClass} font-bold text-center`}
                        >
                            {finalScore}%
                        </Paragraph>
                    </div>
                </foreignObject>
            </svg>
        </div>
    );
};

export default ReputationBadge;
