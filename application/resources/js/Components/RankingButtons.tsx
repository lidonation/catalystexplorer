import React from 'react';
import Button from './atoms/Button';
import Paragraph from './atoms/Paragraph';
import ThumbsDownIcon from './svgs/ThumbsDownIcon';
import ThumbsUpIcon from './svgs/ThumbsUpIcon';
import { useTranslation } from 'react-i18next';

type RankingButtonsProps = {
    isLoadingPositive: boolean;
    isLoadingNegative: boolean;
    markPositive: () => void;
    markNegative: () => void;
    positiveRankings: number;
    negativeRankings: number;
};

const RankingButtons: React.FC<RankingButtonsProps> = ({
    isLoadingPositive,
    isLoadingNegative,
    markPositive,
    markNegative,
    positiveRankings,
    negativeRankings,
}) => {
    const { t } = useTranslation();
    
    return (
        <div className="flex gap-2">
            <Button
                className={`bg-success/30 border-success text-success flex items-center gap-1 rounded-md border p-1  ${
                    isLoadingPositive ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={markPositive}
                disabled={isLoadingPositive}
            >
                {isLoadingPositive ? (
                    t('reviews.processing')
                ) : (
                    <>
                        <ThumbsUpIcon />
                        <Paragraph className="font-bold">
                            {t('reviews.yes')}
                        </Paragraph>
                        <Paragraph>{`(${positiveRankings})`}</Paragraph>
                    </>
                )}
            </Button>

            <Button
                className={`bg-error/30 border-error text-error flex items-center gap-1 rounded-md border p-2 ${
                    isLoadingNegative ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={markNegative}
                disabled={isLoadingNegative}
            >
                {isLoadingNegative ? (
                    t('reviews.processing')
                ) : (
                    <>
                        <ThumbsDownIcon />
                        <Paragraph className="font-bold">
                            {t('reviews.no')}
                        </Paragraph>
                        <Paragraph>{`(${negativeRankings})`}</Paragraph>
                    </>
                )}
            </Button>
        </div>
    );
};

export default RankingButtons;
